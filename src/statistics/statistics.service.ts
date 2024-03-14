import { Injectable } from '@nestjs/common';
import { Session, SessionStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class StatisticsService {
    constructor(private readonly prisma: PrismaService) {}

    async getQuizCompletionStats(
        quizId: string,
        status?: SessionStatus | null,
    ): Promise<{ count: number; sessions: Session[] }> {
        const sessions = await this.prisma.session.findMany({
            where: {
                AND: [{ quizId }, { status: status }],
            },
            include: {
                SelectedAnswer: true,
            },
        });
        return {
            count: sessions.length,
            sessions,
        };
    }

    async getQuestionStatistics(questionId: string): Promise<any> {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: {
                options: true, // Включаем опции вопроса
            },
        });

        if (!question) {
            return null;
        }

        // Получаем выбранные ответы для данного вопроса
        const selectedAnswers = await this.prisma.selectedAnswer.findMany({
            where: { questionId }, // Фильтруем выбранные ответы по ID вопроса
        });

        // Создаем объект для хранения статистики по опциям вопроса
        const optionsStatistics = question.options.map((option) => ({
            value: option.value,
            count: 0, // Начальное количество выборов для данной опции
            id: option.id,
            weight: option.weight, // Добавляем вес каждой опции
        }));

        let totalWeight = 0;

        // Перебираем выбранные ответы и считаем количество выборов для каждой опции
        selectedAnswers.forEach((selectedAnswer) => {
            const optionIndex = optionsStatistics.findIndex((option) => option.id === selectedAnswer.answerId);
            if (optionIndex !== -1) {
                optionsStatistics[optionIndex].count++;
                totalWeight += optionsStatistics[optionIndex].weight; // Увеличиваем общий вес на вес этой опции
            }
        });

        const averageWeight = selectedAnswers.length > 0 ? totalWeight / selectedAnswers.length : 0;

        // Структура для статистики
        return {
            question: question.title,
            averageWeight,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            options: optionsStatistics.map(({ id, ...rest }) => rest),
        };
    }

    async calculateAverageScoresByCompany(quizId: string): Promise<any[]> {
        // Список доменов основных компаний
        const companyDomains = ['ncoc.kz', 'kpo.kz', 'tengizchevroil.com', 'anpz.kz'];
        const ncocEmailMappings = {
            'NCOC HSE': ['dana.yerzhanova2@ncoc.kz', 'talgat.kussainov@ncoc.kz', 'snurtaza@mail.ru'],
            'NCOC Service': ['yerlan.kussainov@ncoc.kz'],
        };

        const sessions = await this.prisma.session.findMany({
            where: { quizId, status: SessionStatus.COMPLETED },
            include: {
                email: true,
                SelectedAnswer: {
                    include: {
                        question: {
                            include: {
                                options: true,
                            },
                        },
                    },
                },
            },
        });

        const scoresByCompany: Record<string, { totalWeight: number; count: number }> = {};

        sessions.forEach((session) => {
            const domain = session.email.email.split('@')[1];
            let company = companyDomains.includes(domain) ? domain : 'others';

            if (domain === 'ncoc.kz') {
                const teamName = Object.keys(ncocEmailMappings).find((team) =>
                    ncocEmailMappings[team].includes(session.email.email.toLowerCase()),
                );
                company = teamName || company;
            }

            if (!scoresByCompany[company]) {
                scoresByCompany[company] = { totalWeight: 0, count: 0 };
            }

            let sessionTotalWeight = 0;
            session.SelectedAnswer.forEach((selectedAnswer) => {
                const maxOptionWeight = Math.max(...selectedAnswer.question.options.map((option) => option.weight));
                const selectedOption = selectedAnswer.question.options.find(
                    (option) => option.id === selectedAnswer.answerId,
                );
                if (selectedOption) {
                    // Нормализуем вес выбранного ответа относительно максимального веса вопроса
                    sessionTotalWeight += (selectedOption.weight / maxOptionWeight) * 100;
                }
            });

            // Считаем средний вес для сессии
            if (session.SelectedAnswer.length > 0) {
                scoresByCompany[company].totalWeight += sessionTotalWeight / session.SelectedAnswer.length;
                scoresByCompany[company].count++;
            }
        });

        // Рассчитываем средний вес для каждой компании
        const averageScores = Object.entries(scoresByCompany).map(([company, data]) => {
            return {
                company,
                averageScore: data.count > 0 ? data.totalWeight / data.count : 0,
            };
        });

        return averageScores;
    }

    async calculateQuizStatistics(
        quizId: string,
        searchEmail?: string,
    ): Promise<{
        totalSessions: number;
        completedSessions: number;
        count: number;
        averageScorePercentage: number;
        questions: any[];
    }> {
        const whereCondition = {
            quizId,
            status: SessionStatus.COMPLETED,
            ...(searchEmail && {
                email: {
                    email: {
                        contains: searchEmail,
                    },
                },
            }),
        };

        // Получаем сессии, соответствующие условиям поиска
        const sessions = await this.prisma.session.findMany({
            where: whereCondition,
            include: {
                SelectedAnswer: true, // Включаем выбранные ответы для доступа к вопросам
            },
        });

        if (sessions.length === 0) {
            return null;
        }

        // Получаем уникальные ID вопросов из выбранных ответов
        const questionIds = [
            ...new Set(sessions.flatMap((session) => session.SelectedAnswer.map((sa) => sa.questionId))),
        ];

        // Получаем вопросы по найденным ID
        const questions = await this.prisma.question.findMany({
            where: {
                id: {
                    in: questionIds,
                },
            },
            include: { options: true },
            orderBy: { position: 'asc' },
        });

        let totalAverage = 0;
        const questionsStatistics = await Promise.all(
            questions.map(async (question) => {
                const maxOptionWeight = Math.max(...question.options.map((option) => option.weight));
                const selectedAnswers = sessions
                    .flatMap((session) => session.SelectedAnswer)
                    .filter((sa) => sa.questionId === question.id);

                let questionScore = 0;
                selectedAnswers.forEach((answer) => {
                    const option = question.options.find((option) => option.id === answer.answerId);
                    if (option) {
                        questionScore += option.weight;
                    }
                });

                const averageScore =
                    selectedAnswers.length > 0 ? (questionScore / (maxOptionWeight * selectedAnswers.length)) * 100 : 0;
                totalAverage += averageScore;

                return {
                    questionId: question.id,
                    title: question.title,
                    averageScore,
                };
            }),
        );

        const totalSessions = await this.prisma.session.count({
            where: { quizId },
        });

        // Получаем количество завершенных сессий для данного quizId
        const completedSessions = await this.prisma.session.count({
            where: {
                quizId,
                status: SessionStatus.COMPLETED,
            },
        });

        const overallAverage = questions.length > 0 ? totalAverage / questions.length : 0;

        return {
            count: sessions.length,
            averageScorePercentage: overallAverage,
            questions: questionsStatistics,
            totalSessions,
            completedSessions,
        };
    }

    async getSessionStatistics(sessionId: string): Promise<any> {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                email: true,
                quiz: {
                    select: {
                        title: true,
                        questions: {
                            include: {
                                options: true,
                                SelectedAnswer: {
                                    where: {
                                        sessionId: sessionId,
                                    },
                                    select: {
                                        questionId: true,
                                        answerId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!session) {
            return null;
        }

        let totalWeight = 0;
        let answeredQuestions = 0;

        // Проходим по всем вопросам викторины
        session.quiz.questions.forEach((question) => {
            const selectedAnswer = question.SelectedAnswer[0]; // Предполагаем, что на каждый вопрос один ответ
            if (selectedAnswer) {
                const option = question.options.find((option) => option.id === selectedAnswer.answerId);
                if (option) {
                    totalWeight += option.weight; // Суммируем вес выбранного ответа
                    answeredQuestions += 1; // Учитываем количество отвеченных вопросов
                }
            }
        });

        const averageWeight = answeredQuestions > 0 ? totalWeight / answeredQuestions : 0; // Рассчитываем средний вес

        // Преобразуем данные сессии в нужный формат, добавляем средний вес
        return {
            createdAt: session.createdAt,
            feedBack: session.feedBack,
            email: session.email.email,
            quizTitle: session.quiz.title,
            averageWeight, // Добавляем средний вес выбранных ответов
            questions: session.quiz.questions.map((question) => ({
                title: question.title,
                options: question.options.map((option) => ({
                    value: option.value,
                    isSelected: question.SelectedAnswer.some((answer) => answer.answerId === option.id),
                })),
            })),
        };
    }
}
