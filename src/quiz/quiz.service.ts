import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from '@prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createPaginator, PaginatedResult } from 'prisma-pagination';
import { Prisma, Quiz, QuizStatus, Session, SessionStatus } from '@prisma/client';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { convertToSecondsUtil } from '@common/utils';

@Injectable()
export class QuizService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async getAll(
        page: number,
        perPage: number,
        search: string,
        status: QuizStatus | null,
    ): Promise<PaginatedResult<Quiz>> {
        const paginate = createPaginator({ perPage });

        return paginate<Quiz, Prisma.QuizFindManyArgs>(
            this.prisma.quiz,
            {
                where: {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        ...(search ? [{ tags: { has: search } }] : []),
                    ],
                    ...(status !== null ? { status } : {}),
                },
            },
            {
                page,
            },
        );
    }

    async getAllSessions(quizId: string, page: number, perPage: number, search: string, status: SessionStatus | null) {
        const paginate = createPaginator({ perPage });

        return paginate<Session, Prisma.SessionFindManyArgs>(
            this.prisma.session,
            {
                where: {
                    quiz: {
                        id: {
                            contains: quizId,
                            mode: 'insensitive',
                        },
                    },
                    email: {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    ...(status !== null ? { status } : {}),
                },
                include: {
                    email: true,
                },
            },
            {
                page,
            },
        );
    }

    async save(data: CreateQuizDto) {
        return this.prisma.quiz.create({ data });
    }

    async findOne(id: string, isReset = false): Promise<Quiz> {
        if (isReset) {
            await this.cacheManager.del(id);
        }

        let quiz: Quiz = await this.cacheManager.get(id);

        console.log('cached');

        if (!quiz) {
            quiz = await this.prisma.quiz.findUnique({ where: { id } });

            if (!quiz) {
                return null;
            }

            const sec = convertToSecondsUtil(this.configService.get('CACHE_TTL'));
            await this.cacheManager.set(id, quiz, sec);
        }

        return quiz;
    }

    async delete(id: string) {
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });

        if (!quiz) {
            throw null;
        }

        await this.cacheManager.del(id);

        return this.prisma.quiz.delete({
            where: { id },
        });
    }

    async updateQuiz(id: string, data: Prisma.QuizUpdateInput): Promise<Quiz> {
        const updatedQuiz = await this.prisma.quiz.update({
            where: { id },
            data,
        });

        const sec = convertToSecondsUtil(this.configService.get('CACHE_TTL'));
        await this.cacheManager.set(id, updatedQuiz, sec);

        return updatedQuiz;
    }
}
