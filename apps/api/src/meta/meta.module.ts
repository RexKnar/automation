import { Module, forwardRef } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { AutomationModule } from '../automation/automation.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule, forwardRef(() => AutomationModule)],
    controllers: [MetaController],
    providers: [MetaService],
    exports: [MetaService],
})
export class MetaModule { }
