import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { AtGuard } from '../common/guards';

@Controller('referrals')
export class ReferralController {
    constructor(private readonly referralService: ReferralService) { }

    @Post('validate')
    async validate(@Body() body: { code: string }) {
        return this.referralService.validateReferralCode(body.code);
    }

    @UseGuards(AtGuard)
    @Get('stats')
    async getStats(@Req() req: any) {
        return this.referralService.getStats(req.user.sub);
    }

    @UseGuards(AtGuard)
    @Get('history')
    async getHistory(@Req() req: any) {
        return this.referralService.getHistory(req.user.sub);
    }

    // Admin Endpoints
    // TODO: Use AdminGuard
    @Get('admin/all')
    async getAllReferrals() {
        return this.referralService.getAllReferrals();
    }

    @Post('admin')
    async createReferral(@Body() dto: any) {
        return this.referralService.createReferralAdmin(dto);
    }

    @Post('admin/:id') // Using POST for update to avoid PATCH issues
    async updateReferral(@Req() req: any, @Body() dto: any) {
        return this.referralService.updateReferral(req.params.id, dto);
    }

    @Post('admin/:id/delete')
    async deleteReferral(@Req() req: any) {
        return this.referralService.deleteReferral(req.params.id);
    }

    @Post('admin/:id/suspend')
    async suspendReferral(@Req() req: any) {
        return this.referralService.suspendReferral(req.params.id);
    }

    // Referral Code Management Endpoints
    @Get('admin/codes/all')
    async getAllReferralCodes() {
        return this.referralService.getAllReferralCodes();
    }

    @Post('admin/codes')
    async createReferralCode(@Body() dto: any) {
        return this.referralService.createReferralCode(dto);
    }

    @Post('admin/codes/:id')
    async updateReferralCode(@Req() req: any, @Body() dto: any) {
        return this.referralService.updateReferralCode(req.params.id, dto);
    }

    @Post('admin/codes/:id/delete')
    async deleteReferralCode(@Req() req: any) {
        return this.referralService.deleteReferralCode(req.params.id);
    }
}
