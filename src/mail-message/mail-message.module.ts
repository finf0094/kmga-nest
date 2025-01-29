import { Module } from '@nestjs/common';
import { MailMessageService } from './mail-message.service';
import { MailMessageController } from './mail-message.controller';
import { PrismaService } from '@prisma/prisma.service';

@Module({
    controllers: [MailMessageController],
    providers: [MailMessageService, PrismaService],
})
export class MailMessageModule {}
