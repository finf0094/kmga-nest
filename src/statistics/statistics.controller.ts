import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Session, SessionStatus } from '@prisma/client';
import { Public } from '@common/decorators';

@Public()
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get(':quizId/completion-stats')
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

    @Get('questions/:questionId/statistics')
    async getQuestionStatistics(@Param('questionId', ParseUUIDPipe) questionId: string): Promise<any> {
        const stats = await this.statisticsService.getQuestionStatistics(questionId);
        if (!stats) {
            throw new NotFoundException(`Question with ID ${questionId} not found`);
        }
        return stats;
    }

    @Get(':quizId/statistics')
    async getQuizStatistics(
        @Param('quizId', ParseUUIDPipe) quizId: string,
    ): Promise<{ averageScorePercentage: number }> {
        const averageScorePercentage = await this.statisticsService.calculateQuizStatistics(quizId);
        if (averageScorePercentage === null) {
            throw new NotFoundException(
                `Statistics for quiz with id ${quizId} could not be calculated or no completed sessions found.`,
            );
        }
        return { averageScorePercentage };
    }
}
