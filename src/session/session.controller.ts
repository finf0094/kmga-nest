import { Body, Controller, Param, Post, NotFoundException, ParseUUIDPipe, Get, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { SelectedAnswer, Session, SessionStatus } from '@prisma/client';
import { Public } from '@common/decorators';

@Controller('sessions')
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Public()
    @Get(':sessionId')
    async getSession(@Param('sessionId', ParseUUIDPipe) sessionId: string): Promise<Session> {
        const session = await this.sessionService.getSession(sessionId);

        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        return session;
    }

    @Post('/:sessionId/send/:language')
    async sendSessionToEmail(
        @Param('sessionId', ParseUUIDPipe) sessionId: string,
        @Param('language') language: string,
    ): Promise<{ status: SessionStatus }> {
        const status = await this.sessionService.sendSessionToEmail(sessionId, language);
        return { status };
    }

    @Delete(':id')
    async deleteSession(@Param('id', ParseUUIDPipe) sessionId: string): Promise<void> {
        await this.sessionService.deleteSession(sessionId);
    }

    @Public()
    @Post()
    async createSession(@Body() body: { email: string; quizId: string }): Promise<Session> {
        return this.sessionService.createSession(body.email, body.quizId);
    }

    @Public()
    @Post(':id/start')
    async startQuiz(@Param('id', ParseUUIDPipe) quizSessionId: string): Promise<Session> {
        const session = await this.sessionService.startQuiz(quizSessionId);
        if (!session) {
            throw new NotFoundException(`Session with id ${quizSessionId} does not exist`);
        }
        return session;
    }

    @Public()
    @Post(':id/submit-answer')
    async submitAnswer(
        @Param('id', ParseUUIDPipe) sessionId: string,
        @Body() body: { questionId: string; answerId: string },
    ): Promise<SelectedAnswer> {
        return this.sessionService.submitAnswer(sessionId, body.questionId, body.answerId);
    }

    @Public()
    @Post(':id/end')
    async endQuiz(
        @Param('id', ParseUUIDPipe) quizSessionId: string,
        @Body() body: { feedback: string | null },
    ): Promise<Session> {
        const session = await this.sessionService.endQuiz(quizSessionId, body.feedback);
        if (!session) {
            throw new NotFoundException(`Session with id ${quizSessionId} does not exist`);
        }
        return session;
    }
}
