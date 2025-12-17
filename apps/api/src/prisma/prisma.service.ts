import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL'),
                },
            },
        });
    }

    async onModuleInit() {
        console.log('Connecting to database...');
        try {
            await this.$connect();
            console.log('Connected to database successfully');
        } catch (error) {
            console.error('Failed to connect to database:', error);
        }
    }
}
