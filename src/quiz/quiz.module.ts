import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaService } from '@prisma/prisma.service';

@Module({
    imports: [CacheModule.register({})],
    controllers: [QuizController],
    providers: [QuizService, PrismaService],
})
export class QuizModule {}
