import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { AutomationService } from '../automation/automation.service';

@Injectable()
export class MetaService {
    constructor(
        private config: ConfigService,
        private http: HttpService,
        private prisma: PrismaService,
        private automationService: AutomationService,
    ) { }

    getAuthUrl(state: string): string {
        const appId = this.config.get<string>('FACEBOOK_APP_ID');
        const redirectUri = this.config.get<string>('META_REDIRECT_URI') || 'https://rexocialapi.rexcoders.in/meta/callback';
        const scope = 'instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_show_list,pages_read_engagement,business_management';

        if (!appId) {
            throw new InternalServerErrorException('FACEBOOK_APP_ID not configured');
        }

        return `https://www.facebook.com/v24.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
    }

    async exchangeCodeForToken(code: string) {
        const appId = this.config.get<string>('FACEBOOK_APP_ID');
        const appSecret = this.config.get<string>('FACEBOOK_APP_SECRET');
        const redirectUri = this.config.get<string>('META_REDIRECT_URI') || 'https://rexocialapi.rexcoders.in/meta/callback';

        if (!appId || !appSecret) {
            throw new InternalServerErrorException('Facebook credentials not configured');
        }

        try {
            const { data } = await firstValueFrom(
                this.http.get('https://graph.facebook.com/v24.0/oauth/access_token', {
                    params: {
                        client_id: appId,
                        redirect_uri: redirectUri,
                        client_secret: appSecret,
                        code: code,
                    },
                })
            );
            return data;
        } catch (error) {
            console.error('Error exchanging code for token:', error?.response?.data || error.message);
            throw new InternalServerErrorException('Failed to exchange code for token');
        }
    }

    async getLongLivedToken(shortLivedToken: string) {
        // Implementation pending
        return shortLivedToken;
    }

    async getBusinessAccounts(accessToken: string) {
        // Implementation pending
        return [];
    }

    async getWhatsAppBusinessAccounts(businessId: string, accessToken: string) {
        // Implementation pending
        return [];
    }

    async getWhatsAppPhoneNumbers(wabaId: string, accessToken: string) {
        // Implementation pending
        return [];
    }

    async getInstagramAccounts(businessId: string, accessToken: string) {
        // Implementation pending
        return [];
    }

    async getInstagramMedia(userId: string, limit: number = 20) {
        // Find the user's connected Instagram channel
        const workspaceMember = await (this.prisma as any).workspaceMember.findFirst({
            where: { userId },
            include: { workspace: true },
        });

        if (!workspaceMember) {
            throw new InternalServerErrorException('No workspace found for user');
        }

        const channel = await (this.prisma as any).channel.findFirst({
            where: {
                workspaceId: workspaceMember.workspaceId,
                type: 'INSTAGRAM',
                isActive: true,
            },
        });

        if (!channel || !channel.config || !channel.config.accessToken) {
            return [];
        }

        const accessToken = channel.config.accessToken;

        try {
            // 1. Get the Instagram Business Account ID
            // We first get the user's pages, then the connected IG account
            const pagesResponse = await firstValueFrom(
                this.http.get(`https://graph.facebook.com/v24.0/me/accounts?fields=instagram_business_account,name`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            );

            const page = pagesResponse.data.data.find((p: any) => p.instagram_business_account);

            if (!page || !page.instagram_business_account) {
                console.warn('No Instagram Business Account found for this user');
                return [];
            }

            const instagramAccountId = page.instagram_business_account.id;

            // 2. Fetch Media
            const mediaResponse = await firstValueFrom(
                this.http.get(`https://graph.facebook.com/v24.0/${instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            );

            return mediaResponse.data.data || [];

        } catch (error) {
            console.error('Error fetching Instagram media:', error?.response?.data || error.message);
            return [];
        }
    }

    async saveMetaTokens(userId: string, accessToken: string, expiresIn: number, metaBusinessId?: string) {
        console.log(`[MetaService] Saving tokens for user ${userId}. Initial metaBusinessId: ${metaBusinessId}`);

        // If metaBusinessId is not provided, fetch it
        if (!metaBusinessId) {
            try {
                console.log('[MetaService] Fetching Instagram Business Account ID...');
                const pagesResponse = await firstValueFrom(
                    this.http.get(`https://graph.facebook.com/v24.0/me/accounts?fields=instagram_business_account,name`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                );
                console.log('[MetaService] Pages response:', JSON.stringify(pagesResponse.data));

                const page = pagesResponse.data.data.find((p: any) => p.instagram_business_account);
                if (page && page.instagram_business_account) {
                    metaBusinessId = page.instagram_business_account.id;
                    console.log(`[MetaService] Found metaBusinessId: ${metaBusinessId}`);
                } else {
                    console.warn('[MetaService] No Instagram Business Account found in pages response.');
                }
            } catch (error) {
                console.error('Failed to fetch Instagram Business Account ID:', error?.response?.data || error.message);
            }
        }

        // Find workspace where user is OWNER
        const workspaceMember = await (this.prisma as any).workspaceMember.findFirst({
            where: { userId, role: 'OWNER' },
            include: { workspace: true },
        });

        if (!workspaceMember) {
            // Fallback: find any workspace
            const anyMember = await (this.prisma as any).workspaceMember.findFirst({
                where: { userId },
            });

            if (!anyMember) {
                throw new InternalServerErrorException('No workspace found for user');
            }

            // Fetch user name from Meta
            let channelName = 'Instagram Account';
            try {
                const { data: metaUser } = await firstValueFrom(
                    this.http.get(`https://graph.facebook.com/v24.0/me?fields=name`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                );
                if (metaUser && metaUser.name) {
                    channelName = metaUser.name;
                }
            } catch (error) {
                console.error('Failed to fetch Meta user name:', error);
            }

            await (this.prisma as any).channel.create({
                data: {
                    workspaceId: anyMember.workspaceId,
                    type: 'INSTAGRAM',
                    name: channelName,
                    config: {
                        accessToken,
                        expiresIn,
                        metaBusinessId,
                    },
                    isActive: true,
                },
            });
            return;
        }

        // Fetch user name from Meta
        let channelName = 'Instagram Account';
        try {
            const { data: metaUser } = await firstValueFrom(
                this.http.get(`https://graph.facebook.com/v24.0/me?fields=name`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            );
            if (metaUser && metaUser.name) {
                channelName = metaUser.name;
            }
        } catch (error) {
            console.error('Failed to fetch Meta user name:', error);
        }

        const workspaceId = workspaceMember.workspaceId;

        await (this.prisma as any).channel.create({
            data: {
                workspaceId,
                type: 'INSTAGRAM',
                name: channelName,
                config: {
                    accessToken,
                    expiresIn,
                    metaBusinessId,
                },
                isActive: true,
            },
        });
    }

    verifyWebhook(mode: string, token: string, challenge: string) {
        // In production, this should be an env var
        const VERIFY_TOKEN = 'rexcoders-automation-token';

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('WEBHOOK_VERIFIED');
                return challenge;
            } else {
                throw new ForbiddenException('Verification failed');
            }
        }
    }

    async processWebhook(body: any) {
        console.log('Received Webhook:', JSON.stringify(body, null, 2));

        if (body.object === 'instagram') {
            for (const entry of body.entry) {
                for (const messaging of entry.messaging || []) {
                    // Handle Messages (DM)
                    if (messaging.message && !messaging.message.is_echo) {
                        await this.handleInstagramMessage(messaging);
                    }
                }

                for (const change of entry.changes || []) {
                    // Handle Comments
                    if (change.field === 'comments') {
                        await this.handleInstagramComment(change.value);
                    }
                }
            }
        }
        return 'EVENT_RECEIVED';
    }

    private async handleInstagramComment(comment: any) {
        // comment structure: { id, text, from: { id, username }, media: { id, media_product_type }, parent_id }
        console.log('Processing Comment:', comment);

        await this.automationService.handleIncomingComment({
            mediaId: comment.media.id,
            text: comment.text,
            commentId: comment.id,
            fromId: comment.from.id,
            fromUsername: comment.from.username,
        });
    }

    private async handleInstagramMessage(messaging: any) {
        console.log('Processing Message:', messaging);
        // messaging structure: { sender: { id }, recipient: { id }, timestamp, message: { mid, text } }

        if (!messaging.message || !messaging.message.text) {
            return;
        }

        await this.automationService.handleIncomingMessage({
            text: messaging.message.text,
            messageId: messaging.message.mid,
            fromId: messaging.sender.id,
        });
    }

    async connectManually(userId: string, accessToken: string) {
        // Implementation pending
    }

    async disconnectMeta(userId: string) {
        // Implementation pending
    }
}
