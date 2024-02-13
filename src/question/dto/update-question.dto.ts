import { IsString, IsOptional, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateOptionDto {
    @IsString()
    id: string;

    @IsString()
    value: string;

    @IsNumber()
    weight: number;
}

export class UpdateQuestionDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateOptionDto)
    options: UpdateOptionDto[];
}
