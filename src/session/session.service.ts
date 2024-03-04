import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { MailService } from '@mail/mail.service';
import { SelectedAnswer, Session, SessionStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) {}

    async getSession(sessionId: string): Promise<Session> {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                quiz: true,
                email: true,
            },
        });

        if (!session) {
            return null;
        }

        return session;
    }

    async deleteSession(sessionId: string): Promise<void> {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        await this.prisma.session.delete({
            where: { id: sessionId },
        });
    }

    async createSession(email: string, quizId: string): Promise<Session> {
        // Проверяем, существует ли email
        let emailEntry = await this.prisma.email.findUnique({
            where: { email },
        });

        // Если email не существует, создаем его
        if (!emailEntry) {
            emailEntry = await this.prisma.email.create({
                data: { email },
            });
        }

        // Создаем сессию
        const session = await this.prisma.session.create({
            data: {
                quizId,
                emailId: emailEntry.id, // Используем emailId для связи
                status: SessionStatus.NOT_STARTED,
                score: 0,
            },
        });

        return session;
    }

    async sendSessionToEmail(sessionId: string, language: string): Promise<SessionStatus> {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { email: true },
        });

        if (!session) {
            return SessionStatus.NOT_STARTED;
        }

        const sessionUrl = `${this.configService.get('FRONTEND_URL')}/session/${session.id}`;

        try {
            await this.mailService.sendSessionUrl(session.email.email, sessionUrl, language);
            await this.prisma.session.update({
                where: { id: sessionId },
                data: { status: SessionStatus.MAIL_SENDED, sendedTime: new Date() },
            });
            return SessionStatus.MAIL_SENDED;
        } catch (error) {
            console.error('Error sending session URL via email:', error);
            return SessionStatus.NOT_STARTED;
        }
    }

    async startQuiz(quizSessionId: string): Promise<Session> {
        let quizSession = await this.prisma.session.findUnique({
            where: { id: quizSessionId },
            include: { quiz: true },
        });

        if (!quizSession) {
            return null;
        }

        quizSession = await this.prisma.session.update({
            where: { id: quizSessionId },
            data: {
                startTime: new Date(),
                status: SessionStatus.IN_PROGRESS,
            },
            include: { quiz: true }, // Включаем quiz при обновлении, чтобы соответствовать ожидаемому типу возвращаемого значения
        });

        return quizSession;
    }

    async submitAnswer(sessionId: string, questionId: string, answerId: string): Promise<SelectedAnswer> {
        // Находим сессию по ID
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException(`Session with id ${sessionId} does not exist`);
        }

        // Проверяем, что сессия находится в статусе IN_PROGRESS
        if (session.status !== SessionStatus.IN_PROGRESS) {
            throw new Error('Session is not in progress');
        }

        // Находим вес (очки) выбранного ответа
        const selectedOption = await this.prisma.option.findUnique({
            where: { id: answerId },
        });

        if (!selectedOption) {
            throw new NotFoundException(`Option with id ${answerId} does not exist`);
        }

        const selectedAnswer = await this.prisma.selectedAnswer.upsert({
            where: {
                sessionId_questionId: { sessionId, questionId },
            },
            update: {
                answerId,
            },
            create: {
                sessionId,
                questionId,
                answerId,
            },
        });

        // Обновляем счет сессии, добавляя вес выбранного ответа
        await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                score: {
                    increment: selectedOption.weight,
                },
            },
        });

        return selectedAnswer;
    }

    async endQuiz(quizSessionId: string, feedBack: string | null): Promise<Session> {
        let quizSession = await this.prisma.session.findUnique({
            where: { id: quizSessionId },
        });

        if (!quizSession) {
            return null;
        }

        quizSession = await this.prisma.session.update({
            where: { id: quizSessionId },
            data: {
                endTime: new Date(),
                status: SessionStatus.COMPLETED,
                feedBack,
            },
        });

        return quizSession;
    }
}
