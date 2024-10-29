export interface CreateSessionDto {
    email: string;
    url: string;
    subject: string;
    title: string;
    text: string;
    footer?: string;
}
