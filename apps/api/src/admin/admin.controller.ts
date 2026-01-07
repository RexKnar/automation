import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Post('login')
    login(@Body() dto: { email: string; password: string }) {
        return this.adminService.login(dto);
    }

    // TODO: Add AdminGuard
    @Get('users')
    getAdmins() {
        return this.adminService.getAdmins();
    }

    @Post('users')
    createAdmin(@Body() dto: any) {
        return this.adminService.createAdmin(dto);
    }

    @UseGuards(AdminGuard)
    @Get('tenants')
    getTenants() {
        return this.adminService.getTenants();
    }

    @UseGuards(AdminGuard)
    @Post('tenants/:id/toggle')
    toggleTenantStatus(@Req() req: any) {
        return this.adminService.toggleTenantStatus(req.params.id);
    }

    @UseGuards(AdminGuard)
    @Post('tenants/:id/plan')
    updateTenantPlan(@Req() req: any, @Body() body: { planId: string }) {
        return this.adminService.updateTenantPlan(req.params.id, body.planId);
    }

    @UseGuards(AdminGuard)
    @Get('plans')
    getPlans() {
        return this.adminService.getPlans();
    }

    @UseGuards(AdminGuard)
    @Post('plans')
    createPlan(@Body() dto: any) {
        return this.adminService.createPlan(dto);
    }

    @UseGuards(AdminGuard)
    @Post('plans/:id') // Using POST for update to avoid PATCH issues if any, or stick to standard
    updatePlan(@Req() req: any, @Body() dto: any) {
        return this.adminService.updatePlan(req.params.id, dto);
    }

    @UseGuards(AdminGuard)
    @Post('plans/:id/delete') // Using POST for delete to be safe, or DELETE method
    deletePlan(@Req() req: any) {
        return this.adminService.deletePlan(req.params.id);
    }

    @UseGuards(AdminGuard)
    @Get('referrals')
    getReferrals() {
        return this.adminService.getReferrals();
    }

    @UseGuards(AdminGuard)
    @Post('referrals/:id/payout')
    processPayout(@Req() req: any) {
        return this.adminService.processPayout(req.params.id);
    }
}
