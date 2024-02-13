import { Body, Controller, Delete, Get, Param, Post, Put, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
import { Public } from '@common/decorators';

@Public()
@Controller('quizzes/:quizId/questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post()
    async createQuestion(@Param('quizId', ParseUUIDPipe) quizId: string, @Body() createQuestionDto: CreateQuestionDto) {
        const question = await this.questionService.createQuestion(quizId, createQuestionDto);
        if (!question) {
            throw new NotFoundException(`Quiz with id ${quizId} not found`);
        }
        return question;
    }

    @Get()
    async getAllQuestions(@Param('quizId', ParseUUIDPipe) quizId: string) {
        const questions = await this.questionService.getAllQuestions(quizId);
        if (!questions) {
            throw new NotFoundException(`Quiz with id ${quizId} not found or has no questions`);
        }
        return questions;
    }

    @Get(':id')
    async getQuestion(@Param('id', ParseUUIDPipe) id: string) {
        const question = await this.questionService.getQuestion(id);
        if (!question) {
            throw new NotFoundException(`Question with id ${id} not found`);
        }
        return question;
    }

    @Put(':id')
    async updateQuestion(@Param('id', ParseUUIDPipe) id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
        await this.questionService.updateQuestion(id, updateQuestionDto);
        return { message: 'Question updated successfully' };
    }

    @Delete(':id')
    async deleteQuestion(@Param('id', ParseUUIDPipe) questionId: string) {
        await this.questionService.deleteQuestion(questionId);
        return { message: 'Question deleted successfully' };
    }
}
