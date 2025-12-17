import { Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
    constructor(private readonly configService: ConfigService) { }

    async exchangeCodeForToken(userId: number, code: string) {
        throw new NotImplementedException('WhatsApp integration pending refactor');
    }

    async saveWhatsappDetails(userId: number, details: { wabaId: string; phoneNumberId: string; phoneNumber: string }) {
        throw new NotImplementedException('WhatsApp integration pending refactor');
    }
}
