import { Module, forwardRef } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MetaModule } from '../meta/meta.module';

@Module({
    imports: [PrismaModule, HttpModule, ConfigModule, forwardRef(() => MetaModule)],
    controllers: [AutomationController],
    providers: [AutomationService],
    exports: [AutomationService],
})
export class AutomationModule { }
