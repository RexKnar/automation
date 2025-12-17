import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto';

@Injectable()
export class WorkspacesService {
    constructor(private prisma: PrismaService) { }

    async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
        // Check if user already has a workspace with same name (optional)
        // Or just create it.

        // Ensure slug is unique
        const slug = dto.slug || dto.name.toLowerCase().replace(/ /g, '-');

        const existing = await this.prisma.workspace.findUnique({
            where: { slug },
        });

        if (existing) {
            throw new ConflictException('Workspace with this slug already exists');
        }

        const workspace = await this.prisma.workspace.create({
            data: {
                name: dto.name,
                slug,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                    },
                },
            },
        });

        return workspace;
    }

    async updateWorkspace(workspaceId: string, dto: UpdateWorkspaceDto) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        return this.prisma.workspace.update({
            where: { id: workspaceId },
            data: dto,
        });
    }

    async getWorkspace(workspaceId: string) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { channels: true },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        return workspace;
    }

    async getUserWorkspaces(userId: string) {
        return this.prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                channels: true,
            },
        });
    }
}
