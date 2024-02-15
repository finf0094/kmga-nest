import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors();
    app.enableCors({
        origin: ['https://thriveread.com', 'http://localhost:5173', 'http://195.49.210.212:5173'],
        credentials: true,
    });
    await app.listen(3000);
}

bootstrap();
