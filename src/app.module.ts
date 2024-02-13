import { JwtAuthGuard } from '@auth/guargs/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@auth/auth.module';
import { PrismaModule } from '@prisma/prisma.module';
import { UserModule } from '@user/user.module';
import { QuizModule } from '@quiz/quiz.module';
import { StatisticsModule } from '@statistics/statistics.module';
import { QuestionModule } from '@question/question.module';
import { SessionModule } from '@session/session.module';
import { MailModule } from '@mail/mail.module';

@Module({
    imports: [
        UserModule,
        PrismaModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        QuizModule,
        StatisticsModule,
        QuestionModule,
        SessionModule,
        MailModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
