import { ArrayMinSize, IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
    @IsString()
    title: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOptionDto)
    options: CreateOptionDto[];
}

export class CreateOptionDto {
    @IsString()
    value: string;

    @IsNumber()
    weight: number;
}
