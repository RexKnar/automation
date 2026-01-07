import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { MetaModule } from './meta/meta.module';
import { GoogleModule } from './google/google.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AutomationModule } from './automation/automation.module';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { PaymentModule } from './payment/payment.module';
import { RolesModule } from './roles/roles.module';
import { InvitationsModule } from './invitations/invitations.module';
import { SeedModule } from './seed/seed.module';
import { AdminModule } from './admin/admin.module';
import { ReferralModule } from './referral/referral.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    AuthModule,
    WorkspacesModule,
    MetaModule,
    GoogleModule,
    WhatsappModule,
    AutomationModule,
    UsersModule,
    PaymentModule,
    RolesModule,
    RolesModule,
    InvitationsModule,
    SeedModule,
    AdminModule,
    ReferralModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

  ],
})
export class AppModule { }
