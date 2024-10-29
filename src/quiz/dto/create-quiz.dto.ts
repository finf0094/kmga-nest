import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { QuizStatus } from '@prisma/client';

export class CreateQuizDto {
    @IsString()
    title: string;

    @IsString()
    emailTitle: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    footer?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    tags?: string[];

    @IsOptional()
    @IsEnum(QuizStatus)
    status?: QuizStatus;
}
