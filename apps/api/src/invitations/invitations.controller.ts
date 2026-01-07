import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';

@Controller('invitations')
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Post()
    @UseGuards(AtGuard)
    create(
        @Body() dto: CreateInvitationDto,
        @GetCurrentUser('sub') userId: string,
        @Query('workspaceId') workspaceId: string,
    ) {
        return this.invitationsService.create(workspaceId, dto, userId);
    }

    @Get('verify')
    verify(@Query('token') token: string) {
        return this.invitationsService.verify(token);
    }

    @Post('accept')
    @UseGuards(AtGuard)
    accept(
        @Body('token') token: string,
        @GetCurrentUser('sub') userId: string,
    ) {
        return this.invitationsService.accept(token, userId);
    }

    @Get()
    @UseGuards(AtGuard)
    findAll(@Query('workspaceId') workspaceId: string) {
        return this.invitationsService.findAll(workspaceId);
    }

    @Delete(':id')
    @UseGuards(AtGuard)
    remove(
        @Param('id') id: string,
        @Query('workspaceId') workspaceId: string
    ) {
        return this.invitationsService.delete(id, workspaceId);
    }
}
