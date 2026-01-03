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

        return `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
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
                this.http.get('https://graph.facebook.com/v21.0/oauth/access_token', {
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

    getInstagramAuthUrl(state: string): string {
        const appId = this.config.get<string>('INSTAGRAM_CLIENT_ID');
        // Use the same redirect URI as Facebook Login to avoid "Invalid redirect_uri" if only one is whitelisted
        const redirectUri = this.config.get<string>('META_REDIRECT_URI') || 'https://rexocialapi.rexcoders.in/meta/callback';
        const scope = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish';

        // Append :instagram to state to identify the flow in the callback
        const instagramState = `${state}:instagram`;

        console.log(`[MetaService] Generating Instagram Auth URL. Configured INSTAGRAM_CLIENT_ID: ${appId}`);

        if (!appId) {
            const fbAppId = this.config.get<string>('FACEBOOK_APP_ID');
            console.log(`[MetaService] Fallback to FACEBOOK_APP_ID: ${fbAppId}`);
            if (!fbAppId) throw new InternalServerErrorException('INSTAGRAM_CLIENT_ID or FACEBOOK_APP_ID not configured');
            return `https://www.instagram.com/oauth/authorize?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${instagramState}`;
        }

        return `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${instagramState}`;
    }

    async exchangeInstagramCode(code: string) {
        const appId = this.config.get<string>('INSTAGRAM_CLIENT_ID') || this.config.get<string>('FACEBOOK_APP_ID');
        const appSecret = this.config.get<string>('INSTAGRAM_CLIENT_SECRET') || this.config.get<string>('FACEBOOK_APP_SECRET');
        // Must match the redirect_uri used in the auth request
        const redirectUri = this.config.get<string>('META_REDIRECT_URI') || 'https://rexocialapi.rexcoders.in/meta/callback';

        if (!appId || !appSecret) {
            throw new InternalServerErrorException('Instagram credentials not configured');
        }

        try {
            // Instagram Login uses form-data for token exchange
            const params = new URLSearchParams();
            params.append('client_id', appId);
            params.append('client_secret', appSecret);
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', redirectUri);
            params.append('code', code);

            const { data } = await firstValueFrom(
                this.http.post('https://api.instagram.com/oauth/access_token', params)
            );
            return data;
        } catch (error) {
            console.error('Error exchanging IG code for token:', error?.response?.data || error.message);
            throw new InternalServerErrorException('Failed to exchange IG code for token');
        }
    }

    async getLongLivedToken(shortLivedToken: string) {
        const appSecret = this.config.get<string>('INSTAGRAM_CLIENT_SECRET') || this.config.get<string>('FACEBOOK_APP_SECRET');

        if (!appSecret) {
            throw new InternalServerErrorException('Instagram credentials not configured');
        }

        try {
            const { data } = await firstValueFrom(
                this.http.get('https://graph.instagram.com/access_token', {
                    params: {
                        grant_type: 'ig_exchange_token',
                        client_secret: appSecret,
                        access_token: shortLivedToken,
                    },
                })
            );
            return data;
        } catch (error) {
            console.error('Error exchanging for long-lived token:', error?.response?.data || error.message);
            throw new InternalServerErrorException('Failed to get long-lived token');
        }
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
        const instagramAccountId = (channel.config as any).metaBusinessId;

        if (!instagramAccountId) {
            console.warn('No Instagram Business Account ID found in channel config');
            return [];
        }

        try {
            // 2. Fetch Media
            const mediaResponse = await firstValueFrom(
                this.http.get(`https://graph.instagram.com/v21.0/${instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            );
            console.log(mediaResponse);
            return mediaResponse.data.data || mediaResponse.data || [];

        } catch (error) {
            console.error('Error fetching Instagram media:', error?.response?.data || error.message);
            console.log(`https://graph.instagram.com/v21.0/${instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return [];
        }
    }

    async saveInstagramUserToken(userId: string, accessToken: string, expiresIn: number, instagramUserId: string) {
        console.log(`[MetaService] Saving IG User token for user ${userId}. IG User ID: ${instagramUserId}`);

        // Exchange for Long-Lived Token
        try {
            const longLivedData = await this.getLongLivedToken(accessToken);
            if (longLivedData && longLivedData.access_token) {
                console.log('[MetaService] Obtained Long-Lived Token');
                accessToken = longLivedData.access_token;
                expiresIn = longLivedData.expires_in;
            }
        } catch (error) {
            console.warn('[MetaService] Failed to get long-lived token, proceeding with short-lived one:', error.message);
        }

        // Find workspace where user is OWNER or member
        const workspaceMember = await (this.prisma as any).workspaceMember.findFirst({
            where: { userId },
            include: { workspace: true },
        });

        if (!workspaceMember) {
            throw new InternalServerErrorException('No workspace found for user');
        }

        // Fetch user info from Instagram Graph API
        let channelName = 'Instagram User';
        try {
            const { data: igUser } = await firstValueFrom(
                this.http.get(`https://graph.instagram.com/v21.0/me?fields=username,account_type`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            );
            if (igUser && igUser.username) {
                channelName = igUser.username;
            }
        } catch (error) {
            console.error('Failed to fetch IG user info:', error);
        }

        await (this.prisma as any).channel.create({
            data: {
                workspaceId: workspaceMember.workspaceId,
                type: 'INSTAGRAM',
                name: channelName,
                config: {
                    accessToken,
                    expiresIn,
                    metaBusinessId: instagramUserId, // For IG Login, this is the User ID
                    isUserToken: true, // Flag to distinguish from Page Token
                },
                isActive: true,
            },
        });
    }

    async saveMetaTokens(userId: string, accessToken: string, expiresIn: number, metaBusinessId?: string) {
        console.log(`[MetaService] Saving tokens for user ${userId}. Initial metaBusinessId: ${metaBusinessId}`);

        // If metaBusinessId is not provided, fetch it
        let pageAccessToken = accessToken; // Default to user token, but try to get page token

        if (!metaBusinessId) {
            try {
                console.log('[MetaService] Fetching Instagram Business Account ID...');
                const pagesResponse = await firstValueFrom(
                    this.http.get(`https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account,name,access_token`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                );
                console.log('[MetaService] Pages response:', JSON.stringify(pagesResponse.data));

                const page = pagesResponse.data.data.find((p: any) => p.instagram_business_account);
                if (page && page.instagram_business_account) {
                    metaBusinessId = page.instagram_business_account.id;
                    if (page.access_token) {
                        pageAccessToken = page.access_token;
                        console.log('[MetaService] Found Page Access Token');
                    }
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
                    this.http.get(`https://graph.facebook.com/v21.0/me?fields=name`, {
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
                        accessToken: pageAccessToken, // Use Page Token
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
                this.http.get(`https://graph.facebook.com/v21.0/me?fields=name`, {
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
                    accessToken: pageAccessToken, // Use Page Token
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
        // Find workspace where user is a member
        const workspaceMember = await (this.prisma as any).workspaceMember.findFirst({
            where: { userId },
        });

        if (!workspaceMember) {
            throw new InternalServerErrorException('No workspace found for user');
        }

        // Delete the Instagram channel
        await (this.prisma as any).channel.deleteMany({
            where: {
                workspaceId: workspaceMember.workspaceId,
                type: 'INSTAGRAM',
            },
        });
    }

    parseSignedRequest(signedRequest: string): any {
        const [encodedSig, payload] = signedRequest.split('.');
        const appSecret = this.config.get<string>('FACEBOOK_APP_SECRET');

        if (!appSecret) {
            throw new InternalServerErrorException('FACEBOOK_APP_SECRET not configured');
        }

        // Decode the data
        const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('hex');
        const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());

        // Confirm the signature
        const crypto = require('crypto');
        const expectedSig = crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('hex');

        if (sig !== expectedSig) {
            throw new ForbiddenException('Invalid signature');
        }

        return data;
    }

    async handleDeauthorization(signedRequest: string) {
        const data = this.parseSignedRequest(signedRequest);
        const userId = data.user_id;

        console.log(`[MetaService] Deauthorization callback for user ${userId}`);

        // Find channels with this metaBusinessId (which might be the user ID for IG User tokens)
        // Or we might need to store the Meta User ID specifically.
        // For now, let's try to find by config->metaBusinessId or config->accessToken (if we could map it back, but we can't easily)

        // Since we don't strictly store the Meta User ID in a dedicated column, we'll search in the config
        // This is a bit inefficient but works for now.
        // Ideally, we should store metaUserId in the Channel model.

        // NOTE: For Instagram User tokens, metaBusinessId IS the user ID.
        // For Page tokens, it's the Page ID.
        // Deauthorization usually comes from the User.

        // Let's log it for now.
        console.log('[MetaService] Deauthorization data:', data);

        // TODO: Implement actual deletion logic if we can reliably identify the user.
        // For now, we'll just log it as per standard compliance if we can't find the user immediately.

        return { success: true };
    }

    async handleDataDeletion(signedRequest: string) {
        const data = this.parseSignedRequest(signedRequest);
        const userId = data.user_id;

        console.log(`[MetaService] Data deletion callback for user ${userId}`);

        // Generate a confirmation code
        const confirmationCode = require('crypto').randomBytes(8).toString('hex');

        // Return the status URL
        const frontendUrl = process.env.FRONTEND_URL || 'https://rexocial.rexcoders.in';
        const statusUrl = `${frontendUrl}/deletion-status?id=${confirmationCode}`;

        return {
            url: statusUrl,
            confirmation_code: confirmationCode,
        };
    }
}
