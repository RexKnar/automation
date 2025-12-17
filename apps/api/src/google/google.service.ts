import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleService {
    constructor(private config: ConfigService) { }

    getAuthUrl(state: string): string {
        throw new NotImplementedException('Google integration pending refactor');
    }

    async exchangeCodeForToken(code: string) {
        throw new NotImplementedException('Google integration pending refactor');
    }

    async refreshAccessToken(refreshToken: string) {
        throw new NotImplementedException('Google integration pending refactor');
    }

    async getBusinessAccounts(accessToken: string) {
        throw new NotImplementedException('Google integration pending refactor');
    }

    async saveGoogleTokens(userId: string, accessToken: string, expiresIn: number, refreshToken?: string, googleBusinessAccountId?: string) {
        throw new NotImplementedException('Google integration pending refactor');
    }

    async disconnectGoogle(userId: string) {
        throw new NotImplementedException('Google integration pending refactor');
    }
}
