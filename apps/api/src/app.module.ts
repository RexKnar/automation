import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler'; // Import seconds helper
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { MetaModule } from './meta/meta.module';
import { GoogleModule } from './google/google.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AutomationModule } from './automation/automation.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Corrected configuration for v5/v6+
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(60), // Using helper for 1 minute (60,000ms)
          limit: 10,       // Max 10 requests within that minute
        },
      ],
    }),
    AuthModule,
    WorkspacesModule,
    MetaModule,
    GoogleModule,
    WhatsappModule,
    AutomationModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Registering globally
    },
  ],
})
export class AppModule { }