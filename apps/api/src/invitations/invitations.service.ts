import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { randomBytes } from 'crypto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class InvitationsService {
    constructor(
        private prisma: PrismaService,
        private workspacesService: WorkspacesService,
    ) { }

    async create(workspaceId: string, dto: CreateInvitationDto, inviterId: string) {
        // Check if user is already a member
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: {
                workspaceId,
                user: { email: dto.email },
            },
        });

        if (existingMember) {
            throw new ForbiddenException('User is already a member of this workspace');
        }

        // Check if pending invitation exists
        const existingInvite = await this.prisma.invitation.findFirst({
            where: {
                workspaceId,
                email: dto.email,
                status: 'PENDING',
            },
        });

        if (existingInvite) {
            // Resend or update? For now, throw error
            throw new ForbiddenException('Pending invitation already exists for this email');
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = await this.prisma.invitation.create({
            data: {
                workspaceId,
                email: dto.email,
                roleId: dto.roleId,
                assignedChannelIds: dto.channelIds || [],
                token,
                expiresAt,
            },
        });

        // TODO: Send email with invitation link
        // For now, return the token/link for testing
        const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${token}`;

        return { ...invitation, inviteLink };
    }

    async verify(token: string) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
            include: { workspace: true, role: true },
        });

        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.status !== 'PENDING') {
            throw new BadRequestException('Invitation is no longer valid');
        }

        if (new Date() > invitation.expiresAt) {
            throw new BadRequestException('Invitation has expired');
        }

        return invitation;
    }

    async accept(token: string, userId: string) {
        const invitation = await this.verify(token);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.email !== invitation.email) {
            throw new ForbiddenException('This invitation is not for this email address');
        }

        // Add user to workspace
        await this.workspacesService.addMember(
            invitation.workspaceId,
            userId,
            invitation.roleId,
            invitation.assignedChannelIds,
        );

        // Update invitation status
        await this.prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' },
        });

        return { success: true };
    }

    async findAll(workspaceId: string) {
        return this.prisma.invitation.findMany({
            where: { workspaceId },
            include: { role: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async delete(id: string, workspaceId: string) {
        return this.prisma.invitation.delete({
            where: { id, workspaceId }
        });
    }
}
