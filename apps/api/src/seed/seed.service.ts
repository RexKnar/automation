import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) { }

    async onModuleInit() {
        await this.seedSuperAdmin();
        await this.seedPlans();
    }

    private async seedSuperAdmin() {
        const email = this.config.get<string>('SUPER_ADMIN_EMAIL');
        const password = this.config.get<string>('SUPER_ADMIN_PASS');

        if (!email || !password) {
            this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASS not set. Skipping Super Admin seeding.');
            return;
        }

        const existingAdmin = await this.prisma.adminUser.findUnique({
            where: { email },
        });

        if (!existingAdmin) {
            const passwordHash = await bcrypt.hash(password, 10);
            await this.prisma.adminUser.create({
                data: {
                    email,
                    passwordHash,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN',
                },
            });
            this.logger.log(`Super Admin seeded: ${email}`);
        }
    }

    private async seedPlans() {
        const plans = [
            {
                name: 'Free',
                slug: 'free',
                prices: { "USD": 0, "INR": 0 },
                limits: { contacts: 100, emails: 500 },
                features: { whatsapp: false, flowBuilder: true },
                isCustom: false,
            },
            {
                name: 'Pro',
                slug: 'pro',
                prices: { "USD": 29, "INR": 2499 },
                limits: { contacts: 5000, emails: 50000 },
                features: { whatsapp: true, flowBuilder: true },
                isCustom: false,
            },
            {
                name: 'Enterprise',
                slug: 'enterprise',
                prices: { "USD": 99, "INR": 7999 },
                limits: { contacts: 100000, emails: 1000000 },
                features: { whatsapp: true, flowBuilder: true, prioritySupport: true },
                isCustom: false,
            },
        ];

        for (const plan of plans) {
            const existingPlan = await this.prisma.plan.findUnique({
                where: { slug: plan.slug },
            });

            if (!existingPlan) {
                await this.prisma.plan.create({
                    data: plan,
                });
                this.logger.log(`Plan seeded: ${plan.name}`);
            }
        }
    }
}
