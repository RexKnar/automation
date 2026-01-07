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

        const wsReferralCode = `WS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const workspace = await this.prisma.workspace.create({
            data: {
                name: dto.name,
                slug,
                referralCode: wsReferralCode,
                roles: {
                    create: [
                        {
                            name: 'Owner',
                            isSystem: true,
                            permissions: { all: true }
                        },
                        {
                            name: 'Admin',
                            isSystem: true,
                            permissions: {
                                users: { view: true, create: true, edit: true, delete: true },
                                billing: { view: true, create: true, edit: true, delete: true },
                                channels: { view: true, create: true, edit: true, delete: true },
                                flows: { view: true, create: true, edit: true, delete: true },
                                contacts: { view: true, create: true, edit: true, delete: true },
                                conversations: { view: true, create: true, edit: true, delete: true }
                            }
                        },
                        {
                            name: 'Editor',
                            isSystem: true,
                            permissions: {
                                users: { view: true, create: false, edit: false, delete: false },
                                billing: { view: false, create: false, edit: false, delete: false },
                                channels: { view: true, create: true, edit: true, delete: false },
                                flows: { view: true, create: true, edit: true, delete: false },
                                contacts: { view: true, create: true, edit: true, delete: false },
                                conversations: { view: true, create: true, edit: true, delete: false }
                            }
                        },
                        {
                            name: 'Agent',
                            isSystem: true,
                            permissions: {
                                users: { view: false, create: false, edit: false, delete: false },
                                billing: { view: false, create: false, edit: false, delete: false },
                                channels: { view: true, create: false, edit: false, delete: false },
                                flows: { view: true, create: false, edit: false, delete: false },
                                contacts: { view: true, create: false, edit: false, delete: false },
                                conversations: { view: true, create: true, edit: true, delete: false }
                            }
                        },
                    ]
                }
            },
        });

        // Fetch the Owner role
        const ownerRole = await this.prisma.role.findFirst({
            where: { workspaceId: workspace.id, name: 'Owner' }
        });

        // Add creator as member with Owner role
        await this.prisma.workspaceMember.create({
            data: {
                userId,
                workspaceId: workspace.id,
                role: 'OWNER',
                roleId: ownerRole?.id
            }
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
            include: {
                channels: true,
                members: {
                    include: {
                        user: true,
                        userRole: true,
                        assignedChannels: true
                    }
                }
            },
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
    async updatePlan(workspaceId: string, plan: 'FREE' | 'PRO' | 'ENTERPRISE') {
        return this.prisma.workspace.update({
            where: { id: workspaceId },
            data: { plan },
        });
    }

    async addMember(workspaceId: string, userId: string, roleId: string, channelIds: string[] = []) {
        // Check if user is already a member
        const existing = await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId,
                },
            },
        });

        if (existing) {
            // Update existing member? Or throw?
            // For now, update role and channels
            return this.prisma.workspaceMember.update({
                where: { id: existing.id },
                data: {
                    roleId,
                    assignedChannels: {
                        set: channelIds.map(id => ({ id })),
                    },
                },
            });
        }

        return this.prisma.workspaceMember.create({
            data: {
                userId,
                workspaceId,
                roleId,
                assignedChannels: {
                    connect: channelIds.map(id => ({ id })),
                },
            },
        });
    }
    async removeMember(workspaceId: string, memberId: string) {
        // Prevent removing the last owner? (Optional but good practice)
        // For now, just delete
        return this.prisma.workspaceMember.delete({
            where: { id: memberId, workspaceId },
        });
    }

    async updateMemberRole(workspaceId: string, memberId: string, roleId: string) {
        return this.prisma.workspaceMember.update({
            where: { id: memberId, workspaceId },
            data: { roleId },
        });
    }
}
