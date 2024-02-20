import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Delete,
    Put,
    Query,
    NotFoundException,
    UsePipes,
    ValidationPipe,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Quiz, QuizStatus, Role, SessionStatus } from '@prisma/client';
import { PaginatedResult } from 'prisma-pagination';
import { RolesGuard } from '@auth/guargs/role.guard';
import { Roles } from '@common/decorators';

@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.USER)
    async getAllQuizzes(
        @Query('page') page: number = 1,
        @Query('perPage') perPage: number = 10,
        @Query('search') search: string = '',
        @Query('status') status: string,
    ): Promise<PaginatedResult<Quiz>> {
        // Преобразование 'null' в null и обработка как QuizStatus | null
        const statusValue = status === 'null' ? null : (status as QuizStatus | null);
        return this.quizService.getAll(page, perPage, search, statusValue);
    }

    @Get(':quizId/sessions')
    @UseGuards(RolesGuard)
    @Roles(Role.USER)
    async getAllSessions(
        @Param('quizId', ParseUUIDPipe) quizId,
        @Query('page') page: number = 1,
        @Query('perPage') perPage: number = 10,
        @Query('search') search: string = '',
        @Query('status') status: string,
    ) {
        const statusValue = status === 'null' ? null : (status as SessionStatus | null);
        return this.quizService.getAllSessions(quizId, page, perPage, search, statusValue);
    }

    @Get(':id')
    async getQuizById(@Param('id', ParseUUIDPipe) id: string): Promise<Quiz> {
        const quiz = await this.quizService.findOne(id);
        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }
        return quiz;
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(RolesGuard)
    @Roles(Role.USER)
    async createQuiz(@Body() createQuizDto: CreateQuizDto): Promise<Quiz> {
        return this.quizService.save(createQuizDto);
    }

    @Delete(':id')
    async deleteQuiz(@Param('id', ParseUUIDPipe) id: string): Promise<Quiz> {
        const deletedQuiz = await this.quizService.delete(id);
        if (!deletedQuiz) {
            throw new NotFoundException('Quiz not found');
        }
        return deletedQuiz;
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateQuiz(@Param('id', ParseUUIDPipe) id: string, @Body() updateQuizDto: CreateQuizDto): Promise<Quiz> {
        return this.quizService.updateQuiz(id, updateQuizDto);
    }
}
