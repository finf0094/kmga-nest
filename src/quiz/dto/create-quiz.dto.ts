import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { QuizStatus } from '@prisma/client';

export class CreateQuizDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsArray()
    @ArrayMinSize(1)
    tags: string[];

    @IsEnum(QuizStatus)
    status: QuizStatus;
}
