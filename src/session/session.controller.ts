import { Body, Controller, Param, Post, NotFoundException, ParseUUIDPipe, Get } from '@nestjs/common';
import { SessionService } from './session.service';
import { SelectedAnswer, Session } from '@prisma/client';
import { Public } from '@common/decorators';

@Public()
@Controller('sessions')
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Get(':sessionId')
    async getSession(@Param('sessionId', ParseUUIDPipe) sessionId: string): Promise<Session> {
        const session = await this.sessionService.getSession(sessionId);

        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        return session;
    }

    @Post()
    async createSession(@Body() body: { email: string; quizId: string }): Promise<Session> {
        return this.sessionService.createSession(body.email, body.quizId);
    }

    @Post(':id/start')
    async startQuiz(@Param('id', ParseUUIDPipe) quizSessionId: string): Promise<Session> {
        const session = await this.sessionService.startQuiz(quizSessionId);
        if (!session) {
            throw new NotFoundException(`Session with id ${quizSessionId} does not exist`);
        }
        return session;
    }

    @Post(':id/submit-answer')
    async submitAnswer(
        @Param('id', ParseUUIDPipe) sessionId: string,
        @Body() body: { questionId: string; answerId: string },
    ): Promise<SelectedAnswer> {
        return this.sessionService.submitAnswer(sessionId, body.questionId, body.answerId);
    }

    @Post(':id/end')
    async endQuiz(@Param('id', ParseUUIDPipe) quizSessionId: string): Promise<Session> {
        const session = await this.sessionService.endQuiz(quizSessionId);
        if (!session) {
            throw new NotFoundException(`Session with id ${quizSessionId} does not exist`);
        }
        return session;
    }
}
