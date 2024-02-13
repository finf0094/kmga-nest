import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}
    async sendSessionUrl(email: string, url: string): Promise<void> {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Опрос',
            template: './new-session', // Путь к шаблону в папке templates
            context: {
                email,
                url,
            },
        });
    }
}
