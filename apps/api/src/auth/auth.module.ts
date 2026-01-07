import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';

import { PrismaModule } from '../prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
    imports: [PrismaModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, AtStrategy, RtStrategy, MailService],
})
export class AuthModule { }
