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
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizStatus } from '@prisma/client';
import { Public } from '@common/decorators';

@Public()
@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get()
    async getAllQuizzes(
        @Query('page') page = 1,
        @Query('perPage') perPage = 10,
        @Query('search') search = '',
        @Query('status') status: string,
    ) {
        const statusValue = status !== 'null' ? null : (status as QuizStatus | null);
        return this.quizService.getAll(page, perPage, search, statusValue);
    }

    @Get(':id')
    async getQuizById(@Param('id', ParseUUIDPipe) id: string) {
        const quiz = await this.quizService.findOne(id);
        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }
        return quiz;
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async createQuiz(@Body() createQuizDto: CreateQuizDto) {
        return this.quizService.save(createQuizDto);
    }

    @Delete(':id')
    async deleteQuiz(@Param('id', ParseUUIDPipe) id: string) {
        const deletedQuiz = await this.quizService.delete(id);
        if (!deletedQuiz) {
            throw new NotFoundException('Quiz not found');
        }
        return deletedQuiz;
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateQuiz(@Param('id', ParseUUIDPipe) id: string, @Body() updateQuizDto: CreateQuizDto) {
        return this.quizService.updateQuiz(id, updateQuizDto);
    }
}
