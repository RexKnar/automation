import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming you have this
// import { Request } from 'express';

@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly whatsappService: WhatsappService) { }

    @Post('auth')
    // @UseGuards(JwtAuthGuard)
    async authenticate(@Body() body: { code: string; userId: number }) {
        // TODO: Get userId from Request after implementing AuthGuard
        return this.whatsappService.exchangeCodeForToken(body.userId, body.code);
    }

    @Post('details')
    // @UseGuards(JwtAuthGuard)
    async saveDetails(@Body() body: { userId: number; wabaId: string; phoneNumberId: string; phoneNumber: string }) {
        // TODO: Get userId from Request after implementing AuthGuard
        return this.whatsappService.saveWhatsappDetails(body.userId, {
            wabaId: body.wabaId,
            phoneNumberId: body.phoneNumberId,
            phoneNumber: body.phoneNumber,
        });
    }
}
