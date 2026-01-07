import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, ConfigModule],
    providers: [SeedService],
})
export class SeedModule { }
