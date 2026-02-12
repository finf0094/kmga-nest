import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Session, SessionStatus } from '@prisma/client';
import { Public } from '@common/decorators';

@Public()
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get('quiz/:quizId/completion-stats')
    async getQuizCompletionStats(
        @Param('quizId', ParseUUIDPipe) quizId: string,
        @Query('status') status?: string | null,
    ): Promise<{ count: number; sessions: Session[] }> {
        const statusEnum = status ? (status.toUpperCase() as SessionStatus) : null;
        const stats = await this.statisticsService.getQuizCompletionStats(quizId, statusEnum);

        if (!stats) {
            throw new NotFoundException(`Stats for quiz with ID ${quizId} not found`);
        }

        return stats;
    }

    @Get('questions/:questionId')
    async getQuestionStatistics(@Param('questionId', ParseUUIDPipe) questionId: string): Promise<any> {
        const stats = await this.statisticsService.getQuestionStatistics(questionId);
        if (!stats) {
            throw new NotFoundException(`Question with ID ${questionId} not found`);
        }
        return stats;
    }

    @Get('quiz/:quizId')
    async getQuizStatistics(
        @Param('quizId', ParseUUIDPipe) quizId: string,
        @Query('email') searchEmail?: string,
    ): Promise<{ count: number; averageScorePercentage: number; questions: any[] }> {
        const averageScorePercentage = await this.statisticsService.calculateQuizStatistics(quizId, searchEmail);
        if (averageScorePercentage === null) {
            throw new NotFoundException(
                `Statistics for quiz with id ${quizId} could not be calculated or no completed sessions found.`,
            );
        }
        return averageScorePercentage;
    }

    @Get('quiz/:quizId/company-averages')
    async getCompanyAverages(@Param('quizId', ParseUUIDPipe) quizId: string): Promise<any[]> {
        const averages = await this.statisticsService.calculateAverageScoresByCompany(quizId);
        if (!averages || averages.length === 0) {
            throw new NotFoundException(`Averages for companies for quiz with ID ${quizId} not found`);
        }
        return averages;
    }

    @Get('session/:sessionId')
    async getSessionStatistics(@Param('sessionId') sessionId: string) {
        const statistics = await this.statisticsService.getSessionStatistics(sessionId);
        if (!statistics) {
            throw new NotFoundException(`Statistics for session with id ${sessionId} not found`);
        }
        return statistics;
    }

    @Post('combined')
    async getCombinedStatistics(@Body() body: { quizIds: string[] }): Promise<{
        totalSessions: number;
        completedSessions: number;
        sessionsByYear: { year: number; totalSessions: number; completedSessions: number }[];
    }> {
        if (!body.quizIds || body.quizIds.length === 0) {
            throw new NotFoundException('No quiz IDs provided');
        }
        return this.statisticsService.calculateCombinedStatistics(body.quizIds);
    }
}
