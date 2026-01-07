import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralService {
    constructor(private prisma: PrismaService) { }

    async generateReferralCode(prefix: string = 'REF'): Promise<string> {
        const code = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        // Check uniqueness
        const existing = await (this.prisma as any).referral.findUnique({ where: { code } });
        if (existing) return this.generateReferralCode(prefix);
        return code;
    }

    async validateReferralCode(code: string, planId?: string) {
        // 1. Check User specific code
        const user = await this.prisma.user.findUnique({ where: { referralCode: code } });
        if (user) return { valid: true, type: 'USER', referrerId: user.id };

        // 2. Check Workspace specific code
        const workspace = await this.prisma.workspace.findUnique({ where: { referralCode: code } });
        if (workspace) return { valid: true, type: 'WORKSPACE', referrerId: workspace.id };

        // 3. Check Custom Referral Code
        const referralCode = await (this.prisma as any).referralCode.findUnique({ where: { code } });
        if (referralCode && referralCode.isActive) {
            // Check Expiry
            if (referralCode.expiryDate && new Date() > new Date(referralCode.expiryDate)) {
                return { valid: false, message: 'Code expired' };
            }

            // Check Max Usage
            if (referralCode.maxUsage && referralCode.usageCount >= referralCode.maxUsage) {
                return { valid: false, message: 'Code usage limit reached' };
            }

            // Check Plan Eligibility
            if (planId && referralCode.eligiblePlans.length > 0 && !referralCode.eligiblePlans.includes(planId)) {
                return { valid: false, message: 'Code not applicable for this plan' };
            }

            // Increment usage count (This should ideally happen ONLY when conversion happens, not just validation)
            // For now, keeping it here as per previous logic, but ideally move to "trackConversion"
            // await (this.prisma as any).referralCode.update({
            //     where: { id: referralCode.id },
            //     data: { usageCount: { increment: 1 } },
            // });

            return {
                valid: true,
                type: 'CUSTOM',
                referrerId: referralCode.referrerId,
                codeId: referralCode.id,
                reward: {
                    type: referralCode.rewardType,
                    amount: referralCode.rewardAmount,
                    trigger: referralCode.rewardTrigger
                }
            };
        }

        return { valid: false };
    }

    async createReferral(referrerId: string, refereeId: string, code: string) {
        // Validate code first to get correct referrer if it's a custom code
        const validation = await this.validateReferralCode(code);
        const finalReferrerId = validation.valid ? validation.referrerId : referrerId;

        return (this.prisma as any).referral.create({
            data: {
                referrerId: finalReferrerId,
                refereeId,
                code,
                status: 'PENDING',
            },
        });
    }

    // Referral Code Management
    async getAllReferralCodes() {
        return (this.prisma as any).referralCode.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createReferralCode(dto: any) {
        return (this.prisma as any).referralCode.create({
            data: {
                code: dto.code,
                referrerId: dto.referrerId,
                type: dto.type || 'ALIAS',
                isActive: dto.isActive ?? true,
                rewardType: dto.rewardType || 'FLAT',
                rewardAmount: parseFloat(dto.rewardAmount) || 0,
                eligiblePlans: dto.eligiblePlans || [],
                rewardTrigger: dto.rewardTrigger || 'FIRST_PURCHASE',
                renewalRewardType: dto.renewalRewardType || 'NONE',
                renewalRewardAmount: parseFloat(dto.renewalRewardAmount) || 0,
                maxUsage: dto.maxUsage ? parseInt(dto.maxUsage) : null,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
            },
        });
    }

    async updateReferralCode(id: string, dto: any) {
        const data = { ...dto };
        if (data.rewardAmount) data.rewardAmount = parseFloat(data.rewardAmount);
        if (data.renewalRewardAmount) data.renewalRewardAmount = parseFloat(data.renewalRewardAmount);
        if (data.maxUsage) data.maxUsage = parseInt(data.maxUsage);
        if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

        return (this.prisma as any).referralCode.update({
            where: { id },
            data: data,
        });
    }

    async deleteReferralCode(id: string) {
        return (this.prisma as any).referralCode.delete({
            where: { id },
        });
    }


    async getStats(userId: string) {
        const referrals = await (this.prisma as any).referral.findMany({
            where: { referrerId: userId },
        });

        const total = referrals.length;
        const completed = referrals.filter((r: any) => r.status === 'COMPLETED').length;
        const pending = referrals.filter((r: any) => r.status === 'PENDING').length;
        // Mock earnings for now
        const earnings = completed * 10; // $10 per completed referral

        return { total, completed, pending, earnings };
    }

    async getHistory(userId: string) {
        return (this.prisma as any).referral.findMany({
            where: { referrerId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAllReferrals() {
        return (this.prisma as any).referral.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createReferralAdmin(dto: any) {
        return (this.prisma as any).referral.create({
            data: {
                referrerId: dto.referrerId,
                refereeId: dto.refereeId,
                code: dto.code,
                status: dto.status || 'PENDING',
                rewardStatus: dto.rewardStatus || 'PENDING',
            },
        });
    }

    async updateReferral(id: string, dto: any) {
        return (this.prisma as any).referral.update({
            where: { id },
            data: dto,
        });
    }

    async deleteReferral(id: string) {
        return (this.prisma as any).referral.delete({
            where: { id },
        });
    }

    async suspendReferral(id: string) {
        return (this.prisma as any).referral.update({
            where: { id },
            data: { status: 'SUSPENDED' },
        });
    }
}
