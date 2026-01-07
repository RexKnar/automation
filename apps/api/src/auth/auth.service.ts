import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtPayload, JwtPayloadWithRt } from './types';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
        private mailService: MailService,
    ) { }

    async signup(dto: SignupDto) {
        const hash = await this.hashData(dto.password);
        try {
            const referralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hash,
                    name: dto.name,
                    referralCode,
                },
            });

            // Create default workspace
            const workspaceName = `${dto.name}'s Workspace`;
            const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);

            // Cast prisma to any to access workspace if type is missing
            const wsReferralCode = `WS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await (this.prisma as any).workspace.create({
                data: {
                    name: workspaceName,
                    slug: slug,
                    referralCode: wsReferralCode,
                    members: {
                        create: {
                            userId: user.id,
                            role: 'OWNER',
                        },
                    },
                },
            });

            const tokens = await this.getTokens(user.id, user.email);
            await this.updateRtHash(user.id, tokens.refresh_token);

            // Generate verification token
            const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { verificationToken },
            });

            // Send verification email
            await this.mailService.sendVerificationEmail(user.email, verificationToken);

            return tokens;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials taken');
            }
            throw error;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) throw new ForbiddenException('Access Denied');

        // Cast user to any to access passwordHash if type is missing
        const userAny = user as any;
        if (!userAny.passwordHash) throw new ForbiddenException('Access Denied');

        const passwordMatches = await bcrypt.compare(dto.password, userAny.passwordHash);
        if (!passwordMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: string) {
        return true;
    }

    async refreshTokens(userId: string, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }

    async updateRtHash(userId: string, rt: string) {
        const hash = await this.hashData(rt);
        // No-op for now as per schema limitations
    }

    hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    async getTokens(userId: string, email: string) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: this.config.get<string>('AT_SECRET'),
                    expiresIn: '15m',
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: this.config.get<string>('RT_SECRET'),
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) throw new ForbiddenException('Invalid token');

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null
            },
        });

        return { message: 'Email verified successfully' };
    }

    async resendVerificationEmail(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new ForbiddenException('User not found');
        if (user.emailVerified) throw new ForbiddenException('Email already verified');

        const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verificationToken },
        });

        await this.mailService.sendVerificationEmail(user.email, verificationToken);
        return { message: 'Verification email sent' };
    }
}
