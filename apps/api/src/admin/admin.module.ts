import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        JwtModule.register({}),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
