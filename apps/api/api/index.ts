import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
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

    const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.NEXT_PUBLIC_FRONTEND_URL,
        'http://localhost:3000',
        'https://automation-docs.vercel.app'
    ].filter(Boolean).map(origin => origin?.replace(/\/$/, '')); // Remove trailing slashes

    app.enableCors({
        origin: (requestOrigin, callback) => {
            if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
                callback(null, true);
            } else {
                console.log('Blocked CORS origin:', requestOrigin);
                callback(null, false); // Or callback(new Error('Not allowed by CORS'))
            }
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization',
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
