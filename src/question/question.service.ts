import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
import { Question } from '@prisma/client';

@Injectable()
export class QuestionService {
    constructor(private readonly prisma: PrismaService) {}

    async createQuestion(quizId: string, createQuestionDto: CreateQuestionDto): Promise<Question> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
        });

        if (!quiz) {
            return null;
        }

        return this.prisma.question.create({
            data: {
                title: createQuestionDto.title,
                Quiz: {
                    connect: {
                        id: quizId,
                    },
                },
                options: {
                    create: createQuestionDto.options,
                },
            },
        });
    }

    async getAllQuestions(quizId: string): Promise<Question[]> {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { position: 'asc' },
                },
            },
        });

        if (!quiz) {
            return null;
        }

        return quiz.questions;
    }

    async getQuestion(id: string): Promise<Question> {
        const question = await this.prisma.question.findUnique({
            where: { id },
            include: { options: true },
        });

        if (!question) {
            return null;
        }

        return question;
    }

    async updateQuestion(id: string, updateQuestionDto: UpdateQuestionDto) {
        // Стартуем транзакцию
        const transaction = [];

        // Обновляем информацию о вопросе
        transaction.push(
            this.prisma.question.update({
                where: { id },
                data: {
                    title: updateQuestionDto.title,
                },
            }),
        );

        // Получаем текущие опции вопроса
        const currentOptions = await this.prisma.option.findMany({
            where: { questionId: id },
        });
        const currentOptionIds = currentOptions.map((option) => option.id);

        // Обрабатываем каждую опцию из DTO
        for (const optionDto of updateQuestionDto.options) {
            if (optionDto.id) {
                // Обновляем существующую опцию
                transaction.push(
                    this.prisma.option.update({
                        where: { id: optionDto.id },
                        data: {
                            value: optionDto.value,
                            weight: optionDto.weight,
                        },
                    }),
                );
                // Удаляем ID из списка текущих опций, чтобы не удалять его позже
                const index = currentOptionIds.indexOf(optionDto.id);
                if (index > -1) {
                    currentOptionIds.splice(index, 1);
                }
            } else {
                // Добавляем новую опцию
                transaction.push(
                    this.prisma.option.create({
                        data: {
                            value: optionDto.value,
                            weight: optionDto.weight,
                            questionId: id,
                        },
                    }),
                );
            }
        }

        // Удаляем опции, которые не были обновлены или добавлены
        for (const optionId of currentOptionIds) {
            transaction.push(
                this.prisma.option.delete({
                    where: { id: optionId },
                }),
            );
        }

        // Выполняем транзакцию
        await this.prisma.$transaction(transaction);
    }

    async deleteQuestion(questionId: string): Promise<void> {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return null;
        }

        await this.prisma.question.delete({
            where: { id: questionId },
        });
    }
}
