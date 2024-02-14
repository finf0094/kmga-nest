import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { QuizStatus } from '@prisma/client';

export class CreateQuizDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    tags?: string[];

    @IsOptional()
    @IsEnum(QuizStatus)
    status?: QuizStatus;
}
