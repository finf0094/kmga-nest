import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMailMessageDto {
    @IsUUID()
    quizId: string;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    footer?: string;
}
