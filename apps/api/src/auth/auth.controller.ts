import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { GetCurrentUser } from '../common/decorators';
import { AtGuard, RtGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.signup(dto);
        this.setRefreshTokenCookie(res, tokens.refresh_token);
        return { access_token: tokens.access_token };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.login(dto);
        this.setRefreshTokenCookie(res, tokens.refresh_token);
        return { access_token: tokens.access_token };
    }

    @UseGuards(AtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@GetCurrentUser('sub') userId: string, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(userId);
        res.clearCookie('Refresh');
        return { message: 'Logged out successfully' };
    }

    @UseGuards(RtGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(
        @GetCurrentUser('sub') userId: string,
        @GetCurrentUser('refreshToken') refreshToken: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const tokens = await this.authService.refreshTokens(userId, refreshToken);
        this.setRefreshTokenCookie(res, tokens.refresh_token);
        return { access_token: tokens.access_token };
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @UseGuards(AtGuard)
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    async resendVerification(@GetCurrentUser('sub') userId: string) {
        return this.authService.resendVerificationEmail(userId);
    }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie('Refresh', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
        });
    }
}
