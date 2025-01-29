import {
    Controller,
    Get,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Put,
    Delete,
    Query,
} from '@nestjs/common';
import { MailMessageService } from './mail-message.service';
import { CreateMailMessageDto } from './dto/create-mail-message.dto';

@Controller('mail-messages')
export class MailMessageController {
    constructor(private readonly mailMessageService: MailMessageService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateMailMessageDto) {
        return this.mailMessageService.create(dto);
    }

    @Get()
    getAll(@Query('quizId') quizId: string) {
        return this.mailMessageService.getAll({ quizId });
    }

    @Get(':id')
    getById(@Param('id', ParseUUIDPipe) id: string) {
        return this.mailMessageService.getById(id);
    }

    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateMailMessageDto) {
        return this.mailMessageService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.mailMessageService.delete(id);
    }
}
