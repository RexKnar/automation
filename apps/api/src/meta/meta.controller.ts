import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    Delete,
    Post,
    Body,
    BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { MetaService } from './meta.service';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';
import { randomBytes } from 'crypto';
import { Public } from '../common/decorators';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('meta')
@UseGuards(AtGuard)
export class MetaController {
    constructor(private metaService: MetaService) { }

    @Get('auth')
    @HttpCode(HttpStatus.OK)
    getAuthUrl(@GetCurrentUser('sub') userId: string) {
        const state = randomBytes(16).toString('hex');
        const authUrl = this.metaService.getAuthUrl(`${state}:${userId}`);
        return { authUrl };
    }

    @Get('auth/instagram')
    @HttpCode(HttpStatus.OK)
    getInstagramAuthUrl(@GetCurrentUser('sub') userId: string) {
        const state = randomBytes(16).toString('hex');
        const authUrl = this.metaService.getInstagramAuthUrl(`${state}:${userId}`);
        return { authUrl };
    }

    @Public()
    @Get('callback')
    async handleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: Response,
    ) {
        try {
            const parts = state.split(':');
            const userId = parts[1]; // state format: random:userId[:type]
            const type = parts[2];

            if (type === 'instagram') {
                // Handle Instagram Login Callback
                const tokenData = await this.metaService.exchangeInstagramCode(code);
                await this.metaService.saveInstagramUserToken(userId, tokenData.access_token, tokenData.expires_in, tokenData.user_id);

                const frontendUrl = process.env.FRONTEND_URL || 'https://rexocial.rexcoders.in';
                res.redirect(`${frontendUrl}/dashboard/connect/instagram?status=success`);
                return;
            }

            // Handle Facebook Login Callback
            const tokenData = await this.metaService.exchangeCodeForToken(code);
            await this.metaService.saveMetaTokens(userId, tokenData.access_token, tokenData.expires_in, tokenData.user_id);

            const frontendUrl = process.env.FRONTEND_URL || 'https://rexocial.rexcoders.in';
            res.redirect(`${frontendUrl}/dashboard/connect/instagram?status=success`);
        } catch (error) {
            console.error('Meta OAuth callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'https://rexocial.rexcoders.in';
            res.redirect(`${frontendUrl}/dashboard/connect/instagram?status=error`);
        }
    }

    @Public()
    @Get('callback/instagram')
    async handleInstagramCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: Response,
    ) {
        try {
            const [, userIdStr] = state.split(':');
            const userId = userIdStr;

            const tokenData = await this.metaService.exchangeInstagramCode(code);
            // We need a separate method or flag to indicate this is an IG User Token
            await this.metaService.saveInstagramUserToken(userId, tokenData.access_token, tokenData.expires_in, tokenData.user_id);

            const frontendUrl = process.env.FRONTEND_URL || 'https://rexocial.rexcoders.in';
            res.redirect(`${frontendUrl}/dashboard/connect/instagram?status=success`);
        } catch (error) {
            console.error('Instagram OAuth callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'https://rexocial.rexcoders.in';
            res.redirect(`${frontendUrl}/dashboard/connect/instagram?status=error`);
        }
    }

    @Get('business-accounts')
    @HttpCode(HttpStatus.OK)
    async getBusinessAccounts(@GetCurrentUser('sub') userId: string) {
        return { businesses: [], connected: false };
    }

    @Get('whatsapp-accounts')
    @HttpCode(HttpStatus.OK)
    async getWhatsAppAccounts(@GetCurrentUser('sub') userId: string) {
        return { accounts: [], phoneNumbers: [] };
    }

    @Get('instagram-accounts')
    @HttpCode(HttpStatus.OK)
    async getInstagramAccounts(@GetCurrentUser('sub') userId: string) {
        return { accounts: [] };
    }

    @Get('instagram-media')
    @HttpCode(HttpStatus.OK)
    async getInstagramMedia(@GetCurrentUser('sub') userId: string) {
        const media = await this.metaService.getInstagramMedia(userId);
        return { media };
    }

    @Delete('disconnect')
    @HttpCode(HttpStatus.OK)
    async disconnectMeta(@GetCurrentUser('sub') userId: string) {
        return { message: 'Meta account disconnected successfully' };
    }

    @Get('webhook')
    @Public()
    @SkipThrottle()
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        return this.metaService.verifyWebhook(mode, token, challenge);
    }

    @Post('webhook')
    @Public()
    @SkipThrottle()
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() body: any) {
        return this.metaService.processWebhook(body);
    }

    @Post('connect/manual')
    @HttpCode(HttpStatus.OK)
    async connectManually(
        @GetCurrentUser('sub') userId: string,
        @Body() body: { accessToken: string },
    ) {
        if (!body.accessToken) {
            throw new BadRequestException('Access Token is required');
        }
        // await this.metaService.connectManually(userId, body.accessToken);
        return { success: true, message: 'Connected manually' };
    }
}
