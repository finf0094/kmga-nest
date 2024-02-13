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
        }));

        // Перебираем выбранные ответы и считаем количество выборов для каждой опции
        selectedAnswers.forEach((selectedAnswer) => {
            // Находим индекс опции в массиве опций вопроса
            const optionIndex = optionsStatistics.findIndex((option) => option.value === selectedAnswer.answerId);
            if (optionIndex !== -1) {
                // Увеличиваем счетчик выборов для найденной опции
                optionsStatistics[optionIndex].count++;
            }
        });

        // Структура для статистики
        return {
            question: question.title,
            options: optionsStatistics,
        };
    }

    async calculateQuizStatistics(quizId: string): Promise<number> {
        // Находим все сессии для данной викторины
        const sessions = await this.prisma.session.findMany({
            where: { quizId, status: SessionStatus.COMPLETED },
        });

        if (sessions.length === 0) {
            return null;
        }

        // Подсчитываем общее количество очков, которое можно было набрать в викторине
        const questions = await this.prisma.question.findMany({
            where: { quizId },
            include: { options: true },
        });

        let totalPossibleScore = 0;
        questions.forEach((question) => {
            const maxOptionWeight = Math.max(...question.options.map((option) => option.weight));
            totalPossibleScore += maxOptionWeight;
        });

        // Подсчитываем общее количество набранных очков всеми участниками
        const totalScored = sessions.reduce((acc, session) => acc + session.score, 0);

        // Рассчитываем средний процент правильных ответов
        return (totalScored / (totalPossibleScore * sessions.length)) * 100;
    }
}
