import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [HttpModule],
    controllers: [WhatsappController],
    providers: [WhatsappService, PrismaService],
    exports: [WhatsappService],
})
export class WhatsappModule { }
