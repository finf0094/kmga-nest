import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}
    async sendSessionUrl(email: string, url: string, language: string): Promise<void> {
        const subject = language === 'en' ? 'Survey' : 'Опрос';
        const template = language === 'en' ? './new-session-eng' : './new-session-rus';

        await this.mailerService.sendMail({
            to: email,
            subject,
            template,
            context: {
                url,
            },
        });
    }
}
