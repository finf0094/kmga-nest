import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule], // Убедитесь, что ConfigModule импортирован
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get<string>('EMAIL_SERVER_HOST'),
                    port: config.get<number>('EMAIL_SERVER_PORT'),
                    secure: true, // Используйте true для порта 465, false для других портов
                    auth: {
                        user: config.get<string>('EMAIL_SERVER_USER'),
                        pass: config.get<string>('EMAIL_SERVER_PASSWORD'),
                    },
                },
                defaults: {
                    from: `"KMG Automation" <${config.get<string>('EMAIL_FROM')}>`,
                },
                template: {
                    dir: join(__dirname, 'mail', 'templates'),
                    adapter: new HandlebarsAdapter(), // Или другой адаптер, если нужно
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService], // Инжектируем ConfigService
        }),
    ],
    providers: [MailService],
    exports: [MailService], // Экспортируем MailService для Dependency Injection
})
export class MailModule {}
