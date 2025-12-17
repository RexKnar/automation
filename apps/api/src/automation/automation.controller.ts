import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';

@Controller('automation')
@UseGuards(AtGuard)
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    @Post('flows')
    createFlow(
        @GetCurrentUser('sub') userId: string,
        @Body() body: { name: string; workspaceId: string },
    ) {
        return this.automationService.createFlow(userId, body);
    }

    @Get('flows')
    getFlows(
        @GetCurrentUser('sub') userId: string,
        @Query('workspaceId') workspaceId: string,
    ) {
        return this.automationService.getFlows(userId, workspaceId);
    }

    @Get('flows/:id')
    getFlow(@Param('id') id: string) {
        return this.automationService.getFlow(id);
    }

    @Patch('flows/:id')
    updateFlow(@Param('id') id: string, @Body() body: any) {
        return this.automationService.updateFlow(id, body);
    }

    @Delete('flows/:id')
    deleteFlow(@Param('id') id: string) {
        return this.automationService.deleteFlow(id);
    }

    @Post('flows/:id/trigger')
    triggerFlow(
        @Param('id') id: string,
        @Body() body: { contactId: string },
    ) {
        return this.automationService.triggerFlow(id, body.contactId);
    }
}
