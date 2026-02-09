
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// Use a cached server to prevent re-initialization on every request
// but ensure it's ready before handling the request.
let cachedServer: any;

const bootstrap = async (serverInstance: any) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(serverInstance),
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
                callback(null, false);
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
    return serverInstance;
};

export default async function handler(req: any, res: any) {
    if (!cachedServer) {
        const server = express();
        cachedServer = await bootstrap(server);
    }

    return cachedServer(req, res);
}
