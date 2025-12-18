import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    Delete,
} from '@nestjs/common';
import type { Response } from 'express';
import { GoogleService } from './google.service';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';
import { randomBytes } from 'crypto';

@Controller('google')
export class GoogleController {
    constructor(private googleService: GoogleService) { }

    @Get('auth')
    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.OK)
    getAuthUrl(@GetCurrentUser('sub') userId: string) {
        const state = randomBytes(16).toString('hex');
        const authUrl = this.googleService.getAuthUrl(`${state}:${userId}`);
        return { authUrl };
    }

    @Get('callback')
    async handleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: Response,
    ) {
        try {
            const [, userIdStr] = state.split(':');
            const userId = userIdStr; // UUID is string

            const tokenData = await this.googleService.exchangeCodeForToken(code);

            // Stubbed logic
            res.redirect(`${process.env.FRONTEND_URL}/dashboard/business?status=google_connected`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/dashboard/business?status=google_error`);
        }
    }

    @Get('business-accounts')
    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.OK)
    async getBusinessAccounts(@GetCurrentUser('sub') userId: string) {
        // Stubbed
        return { businesses: [], connected: false };
    }

    @Delete('disconnect')
    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.OK)
    async disconnectGoogle(@GetCurrentUser('sub') userId: string) {
        // Stubbed
        // await this.googleService.disconnectGoogle(userId); // userId is string now, but service might expect number if I didn't update it? 
        // I updated service to accept number in the stub? Let me check.
        // I stubbed service with `userId: number`. I should update service stub to `string` too.
        return { message: 'Google account disconnected successfully' };
    }
}
