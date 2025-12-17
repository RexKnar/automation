import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const server = express();

const createNestServer = async (expressInstance) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );

    app.use(helmet());
    app.use(cookieParser());

    app.enableCors({
        origin: 'http://localhost:3000', // Update this with your production frontend URL
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    await app.init();
};

createNestServer(server)
    .then(() => console.log('NestJS Server initialized'))
    .catch((err) => console.error('NestJS Server failed to start', err));

export default server;
