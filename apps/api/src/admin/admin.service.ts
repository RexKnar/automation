import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private jwtService: JwtService,
    ) { }

    async login(dto: { email: string; password: string }) {
        // Cast to any to bypass type check until client regeneration
        const admin = await (this.prisma as any).adminUser.findUnique({
            where: { email: dto.email },
        });

        if (!admin) throw new ForbiddenException('Access Denied');

        const passwordMatches = await bcrypt.compare(dto.password, admin.passwordHash);
        if (!passwordMatches) throw new ForbiddenException('Access Denied');

        const token = await this.signToken(admin.id, admin.email, admin.role);
        return { access_token: token, user: { name: admin.name, email: admin.email, role: admin.role } };
    }

    async signToken(userId: string, email: string, role: string) {
        return this.jwtService.signAsync(
            {
                sub: userId,
                email,
                role,
                isAdmin: true,
            },
            {
                secret: this.config.get('AT_SECRET'), // Using same secret for simplicity, or use ADMIN_SECRET
                expiresIn: '1d',
            },
        );
    }

    async createAdmin(dto: any) {
        const hash = await bcrypt.hash(dto.password, 10);
        return (this.prisma as any).adminUser.create({
            data: {
                email: dto.email,
                passwordHash: hash,
                name: dto.name,
                role: dto.role,
            },
        });
    }

    async getAdmins() {
        return (this.prisma as any).adminUser.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    }

    async getTenants() {
        const tenants = await (this.prisma as any).workspace.findMany({
            include: {
                currentPlan: true,
                channels: {
                    select: { type: true },
                },
                payments: {
                    where: { status: 'COMPLETED' },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                _count: {
                    select: { members: true, contacts: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return tenants;
    }

    async toggleTenantStatus(id: string) {
        const workspace = await (this.prisma as any).workspace.findUnique({ where: { id } });
        if (!workspace) throw new ForbiddenException('Workspace not found');

        return (this.prisma as any).workspace.update({
            where: { id },
            data: { isActive: !workspace.isActive },
        });
    }

    async updateTenantPlan(id: string, planId: string) {
        return (this.prisma as any).workspace.update({
            where: { id },
            data: { planId },
        });
    }

    async getPlans() {
        return (this.prisma as any).plan.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createPlan(dto: any) {
        return (this.prisma as any).plan.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                prices: dto.prices || {}, // { "USD": 10, "INR": 800 }
                limits: dto.limits || {},
                features: dto.features || {},
                isCustom: dto.isCustom || false,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async updatePlan(id: string, dto: any) {
        return (this.prisma as any).plan.update({
            where: { id },
            data: {
                name: dto.name,
                slug: dto.slug,
                prices: dto.prices,
                limits: dto.limits,
                features: dto.features,
                isCustom: dto.isCustom,
                isActive: dto.isActive,
            },
        });
    }

    async deletePlan(id: string) {
        return (this.prisma as any).plan.delete({
            where: { id },
        });
    }

    async getReferrals() {
        return (this.prisma as any).referral.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async processPayout(id: string) {
        return (this.prisma as any).referral.update({
            where: { id },
            data: { rewardStatus: 'PAID' },
        });
    }
}
