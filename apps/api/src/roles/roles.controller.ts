import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';

@Controller('workspaces/:workspaceId/roles')
@UseGuards(AtGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    create(
        @Param('workspaceId') workspaceId: string,
        @Body() createRoleDto: CreateRoleDto,
    ) {
        return this.rolesService.create(workspaceId, createRoleDto);
    }

    @Get()
    findAll(@Param('workspaceId') workspaceId: string) {
        return this.rolesService.findAll(workspaceId);
    }

    @Get(':id')
    findOne(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
    ) {
        return this.rolesService.findOne(id, workspaceId);
    }

    @Patch(':id')
    update(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ) {
        return this.rolesService.update(id, workspaceId, updateRoleDto);
    }

    @Delete(':id')
    remove(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
    ) {
        return this.rolesService.remove(id, workspaceId);
    }
}
