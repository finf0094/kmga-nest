import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMailMessageDto {
    @IsUUID()
    quizId: string;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsString()
    btnText: string;

    @IsOptional()
    @IsString()
    footer?: string;
}
