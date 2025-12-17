import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    UseGuards,
    HttpCode,
    HttpStatus,
    Param,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto';
import { AtGuard } from '../common/guards';
import { GetCurrentUser } from '../common/decorators';

@Controller('workspaces')
@UseGuards(AtGuard)
export class WorkspacesController {
    constructor(private workspacesService: WorkspacesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createWorkspace(
        @GetCurrentUser('sub') userId: string,
        @Body() dto: CreateWorkspaceDto,
    ) {
        return this.workspacesService.createWorkspace(userId, dto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getUserWorkspaces(@GetCurrentUser('sub') userId: string) {
        return this.workspacesService.getUserWorkspaces(userId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getWorkspace(@Param('id') id: string) {
        return this.workspacesService.getWorkspace(id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updateWorkspace(
        @Param('id') id: string,
        @Body() dto: UpdateWorkspaceDto,
    ) {
        return this.workspacesService.updateWorkspace(id, dto);
    }
}
