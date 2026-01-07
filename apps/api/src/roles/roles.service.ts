import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async create(workspaceId: string, dto: CreateRoleDto) {
        // Check if role with same name exists in workspace
        const existing = await this.prisma.role.findUnique({
            where: {
                workspaceId_name: {
                    workspaceId,
                    name: dto.name,
                },
            },
        });

        if (existing) {
            throw new ForbiddenException('Role with this name already exists');
        }

        return this.prisma.role.create({
            data: {
                workspaceId,
                name: dto.name,
                permissions: dto.permissions || {},
            },
        });
    }

    async findAll(workspaceId: string) {
        return this.prisma.role.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findOne(id: string, workspaceId: string) {
        const role = await this.prisma.role.findFirst({
            where: { id, workspaceId },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async update(id: string, workspaceId: string, dto: UpdateRoleDto) {
        const role = await this.findOne(id, workspaceId);

        if (role.isSystem) {
            throw new ForbiddenException('Cannot update system roles');
        }

        return this.prisma.role.update({
            where: { id },
            data: {
                name: dto.name,
                permissions: dto.permissions,
            },
        });
    }

    async remove(id: string, workspaceId: string) {
        const role = await this.findOne(id, workspaceId);

        if (role.isSystem) {
            throw new ForbiddenException('Cannot delete system roles');
        }

        // Check if role is assigned to any members
        const membersCount = await this.prisma.workspaceMember.count({
            where: { roleId: id },
        });

        if (membersCount > 0) {
            throw new ForbiddenException('Cannot delete role assigned to members');
        }

        return this.prisma.role.delete({
            where: { id },
        });
    }
}
