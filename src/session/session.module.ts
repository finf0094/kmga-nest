import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaService } from '@prisma/prisma.service';
import { MailService } from '@mail/mail.service';

@Module({
    providers: [SessionService, PrismaService, MailService],
    controllers: [SessionController],
})
export class SessionModule {}
