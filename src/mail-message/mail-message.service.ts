import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateMailMessageDto } from './dto/create-mail-message.dto';

@Injectable()
export class MailMessageService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateMailMessageDto) {
        return this.prisma.mailMessage.create({
            data: {
                title: dto.title,
                content: dto.content,
                footer: dto.footer,
                quizId: dto.quizId,
            },
        });
    }

    async getAll({ quizId }: { quizId?: string }) {
        return this.prisma.mailMessage.findMany({
            where: {
                quizId,
            },
        });
    }

    async update(id: string, dto: CreateMailMessageDto) {
        return this.prisma.mailMessage.update({
            where: { id },
            data: {
                title: dto.title,
                content: dto.content,
                footer: dto.footer,
                quizId: dto.quizId,
            },
        });
    }

    async delete(id: string) {
        return this.prisma.mailMessage.delete({
            where: { id },
        });
    }

    async getById(id: string) {
        const message = await this.prisma.mailMessage.findUnique({
            where: { id },
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        return message;
    }
}
