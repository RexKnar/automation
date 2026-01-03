import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { FlowGraph, ExecutionContext, FlowNode } from './types/flow.types';

@Injectable()
export class AutomationService {
    constructor(
        private prisma: PrismaService,
        private http: HttpService,
        private config: ConfigService,
    ) { }

    async createFlow(userId: string, data: {
        name: string;
        workspaceId: string;
        nodes?: any;
        edges?: any;
    }) {
        // Verify workspace access
        const member = await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId: data.workspaceId,
                },
            },
        });

        if (!member) {
            throw new NotFoundException('Workspace not found or access denied');
        }

        return this.prisma.flow.create({
            data: {
                name: data.name,
                workspaceId: data.workspaceId,
                nodes: data.nodes || [],
                edges: data.edges || [],
                channelType: 'INSTAGRAM', // Default for now
                triggerType: 'KEYWORD',   // Default for now
            },
        });
    }

    async getFlows(userId: string, workspaceId: string) {
        if (!workspaceId) {
            return [];
        }

        // Verify membership
        const member = await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId,
                },
            },
        });

        if (!member) {
            throw new NotFoundException('Workspace not found or access denied');
        }

        return this.prisma.flow.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getFlow(id: string) {
        const flow = await this.prisma.flow.findUnique({
            where: { id },
        });
        if (!flow) throw new NotFoundException('Flow not found');
        return flow;
    }

    async updateFlow(id: string, data: any) {
        return this.prisma.flow.update({
            where: { id },
            data,
        });
    }

    async deleteFlow(id: string) {
        return this.prisma.flow.delete({
            where: { id },
        });
    }

    async getLogs(flowId: string) {
        return this.prisma.automationLog.findMany({
            where: { flowId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    // --- Execution Engine ---

    async handleIncomingComment(data: {
        mediaId: string;
        text: string;
        commentId: string;
        fromId: string;
        fromUsername: string;
    }) {
        console.log(`[Automation] Handling Comment from ${data.fromUsername} on ${data.mediaId}: "${data.text}"`);

        // 1. Find all active flows that are triggered by COMMENTS
        // Since we don't have the workspace ID easily, we search globally (or we could optimize by storing IG Account ID)
        // For MVP, we fetch all active flows with triggerType = KEYWORD (which we are using for comments)
        // In a real app, we should filter by the Instagram Account ID associated with the flow's workspace.

        // Debug: Check total flows
        const totalFlows = await this.prisma.flow.count();
        console.log(`[Automation] Total flows in DB: ${totalFlows}`);

        // Debug: Inspect ALL flows
        const allFlows = await this.prisma.flow.findMany();
        console.log(`[Automation] All Flows:`, JSON.stringify(allFlows.map(f => ({ id: f.id, name: f.name, isActive: f.isActive, triggerType: f.triggerType })), null, 2));

        const potentialFlows = await this.prisma.flow.findMany({
            where: {
                isActive: true,
            },
        });

        console.log(`[Automation] Found ${potentialFlows.length} active flows to check.`);
        if (potentialFlows.length > 0) {
            console.log(`[Automation] Flow IDs: ${potentialFlows.map(f => f.id).join(', ')}`);
        }

        for (const flow of potentialFlows) {
            const nodes = flow.nodes as unknown as FlowNode[];
            const triggerNode = nodes.find(n => n.type === 'TRIGGER');

            if (!triggerNode) continue;

            // Check Trigger Logic
            const triggerData = triggerNode.data;

            // 1. Check Post ID (Specific vs Any)
            if (triggerData.triggerType === 'specific') {
                if (triggerData.postId !== data.mediaId) {
                    continue; // Post ID doesn't match
                }
            }
            // If 'any', we continue

            // 2. Check Keywords
            const keywords = triggerData.keywords || [];
            const commentText = data.text.toLowerCase();

            const hasKeyword = keywords.some((k: string) => commentText.includes(k.toLowerCase()));

            if (!hasKeyword && keywords.length > 0) {
                continue; // Keyword doesn't match
            }

            // Match Found! Trigger Flow
            console.log(`[Automation] Flow "${flow.name}" matched! Triggering...`);

            // Check Gates (Follow / Email)
            const canProceed = await this.checkGates(flow, data.fromId, { commentId: data.commentId });
            if (!canProceed) {
                console.log(`[Automation] Flow "${flow.name}" gated. Stopping execution.`);
                continue;
            }

            await this.prisma.automationLog.create({
                data: {
                    flowId: flow.id,
                    workspaceId: flow.workspaceId,
                    triggerType: 'COMMENT',
                    status: 'TRIGGERED',
                    message: `Triggered by comment from ${data.fromUsername}`,
                    metadata: data,
                },
            });

            await this.triggerFlow(flow.id, data.fromId, { commentId: data.commentId });
        }
    }

    async handleIncomingMessage(data: {
        text: string;
        messageId: string;
        fromId: string;
    }) {
        console.log(`[Automation] Handling Message from ${data.fromId}: "${data.text}"`);

        // 0. Check for Waiting States (Email Collection)
        const contact = await this.prisma.contact.findFirst({
            where: {
                channels: {
                    some: {
                        externalId: data.fromId,
                        channel: { type: 'INSTAGRAM' }
                    }
                }
            }
        });

        if (contact && (contact.customData as any)?.automationState === 'WAITING_FOR_EMAIL') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(data.text.trim())) {
                // Valid Email
                await this.prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        email: data.text.trim(),
                        customData: {
                            ...(contact.customData as any),
                            automationState: null,
                            pendingFlowId: null,
                            pendingMetadata: null,
                        }
                    }
                });

                // Resume Flow
                const flowId = (contact.customData as any).pendingFlowId;
                const metadata = (contact.customData as any).pendingMetadata || {};

                if (flowId) {
                    await this.triggerFlow(flowId, data.fromId, metadata);
                }
                return;
            } else {
                // Invalid Email - Ask again
                // We need workspaceId to send message.
                // We can get it from contact.workspaceId
                await this.sendEmailRequest(data.fromId, contact.workspaceId);
                return;
            }
        }

        // 1. Find all active flows triggered by KEYWORD
        const potentialFlows = await this.prisma.flow.findMany({
            where: {
                isActive: true,
                triggerType: 'KEYWORD',
            },
        });

        console.log(`[Automation] Found ${potentialFlows.length} active keyword flows.`);

        for (const flow of potentialFlows) {
            const nodes = flow.nodes as unknown as FlowNode[];
            const triggerNode = nodes.find(n => n.type === 'TRIGGER');

            if (!triggerNode) continue;

            // Check Keywords
            const keywords = triggerNode.data.keywords || [];
            const messageText = data.text.toLowerCase();

            const hasKeyword = keywords.some((k: string) => messageText.includes(k.toLowerCase()));

            if (!hasKeyword && keywords.length > 0) {
                continue;
            }

            // Match Found! Trigger Flow
            console.log(`[Automation] Flow "${flow.name}" matched! Triggering...`);

            // Check Gates
            const canProceed = await this.checkGates(flow, data.fromId, {});
            if (!canProceed) {
                console.log(`[Automation] Flow "${flow.name}" gated. Stopping execution.`);
                continue;
            }

            await this.prisma.automationLog.create({
                data: {
                    flowId: flow.id,
                    workspaceId: flow.workspaceId,
                    triggerType: 'KEYWORD',
                    status: 'TRIGGERED',
                    message: `Triggered by message from ${data.fromId}`,
                    metadata: data,
                },
            });

            await this.triggerFlow(flow.id, data.fromId);
        }
    }

    async processTrigger(workspaceId: string, trigger: { type: 'KEYWORD' | 'COMMENT' | 'STORY_REPLY' | 'WELCOME' | 'DEFAULT_REPLY' | 'NEW_SUBSCRIBER', keyword?: string, contactId: string }) {
        const flow = await this.prisma.flow.findFirst({
            where: {
                workspaceId,
                isActive: true,
                triggerType: trigger.type,
                keywords: trigger.keyword ? { has: trigger.keyword } : undefined,
            },
        });

        if (!flow) return false;

        await this.triggerFlow(flow.id, trigger.contactId);
        return true;
    }

    async triggerFlow(flowId: string, contactId: string, metadata?: any) {
        const flow = await this.getFlow(flowId);
        const nodes = flow.nodes as unknown as FlowNode[];

        // Find Start/Trigger Node
        const startNode = nodes.find(n => n.type === 'TRIGGER');
        if (!startNode) return;

        const context: ExecutionContext = {
            workspaceId: flow.workspaceId,
            contactId,
            flowId,
            variables: metadata || {},
        };

        await this.executeNode(startNode, context, nodes, flow.edges as any);
    }

    private async executeNode(
        node: FlowNode,
        context: ExecutionContext,
        allNodes: FlowNode[],
        allEdges: any[]
    ) {
        console.log(`Executing Node: ${node.type} (${node.id}) for Contact: ${context.contactId}`);

        // 1. Process Node Logic
        switch (node.type) {
            case 'MESSAGE':
                await this.sendMessage(node, context);
                break;
            case 'CONDITION':
                // Evaluate condition and return specific next node
                // For now, just continue
                break;
            case 'DELAY':
                // Schedule job and stop execution
                return;
        }

        // 2. Find Next Node
        const edges = allEdges.filter(e => e.source === node.id);
        if (edges.length === 0) return;

        // For simple linear flows, take the first edge
        const nextNodeId = edges[0].target;
        const nextNode = allNodes.find(n => n.id === nextNodeId);

        if (nextNode) {
            // Recursive execution (should be async/queue based in production)
            await this.executeNode(nextNode, context, allNodes, allEdges);
        }
    }

    async handleFollowConfirmation(contactId: string) {
        console.log(`[Automation] Follow confirmed for ${contactId}`);
        // 1. Find pending flow for this contact
        // We need to store the pending flow ID in the contact's customData or metadata
        // For now, let's assume we store it in `customData.pendingFlowId`

        const contact = await this.prisma.contact.findFirst({
            where: {
                channels: {
                    some: {
                        externalId: contactId,
                        channel: { type: 'INSTAGRAM' }
                    }
                }
            }
        });

        if (!contact || !contact.customData || !(contact.customData as any).pendingFlowId) {
            console.log('[Automation] No pending flow found for follow confirmation.');
            return;
        }

        const flowId = (contact.customData as any).pendingFlowId;
        const metadata = (contact.customData as any).pendingMetadata || {};

        // 2. Clear pending state
        await this.prisma.contact.update({
            where: { id: contact.id },
            data: {
                customData: {
                    ...(contact.customData as any),
                    pendingFlowId: null,
                    pendingMetadata: null,
                    automationState: null, // Clear state
                    isFollower: true, // Mark as follower (trusted)
                }
            }
        });

        // 3. Resume Flow (Trigger it again, checkGates will now pass)
        await this.triggerFlow(flowId, contactId, metadata);
    }

    async checkGates(flow: any, contactId: string, context: any): Promise<boolean> {
        // Check if flow requires Follow or Email
        // Assuming these flags are in the Trigger Node data or Flow metadata
        // Let's assume they are in the Trigger Node for now, or we can add them to Flow model.
        // For this task, I'll check the Trigger Node data.

        const nodes = flow.nodes as unknown as FlowNode[];
        const triggerNode = nodes.find(n => n.type === 'TRIGGER');

        if (!triggerNode) return true;

        const requireFollow = triggerNode.data.requireFollow;
        const requireEmail = triggerNode.data.requireEmail;

        if (!requireFollow && !requireEmail) return true;

        // Fetch Contact
        let contact = await this.prisma.contact.findFirst({
            where: {
                channels: {
                    some: {
                        externalId: contactId,
                        channel: { type: 'INSTAGRAM' }
                    }
                }
            },
            include: { channels: true }
        });

        // If contact doesn't exist, create it (basic)
        if (!contact) {
            // We need workspaceId. It's in the flow.
            const channel = await this.prisma.channel.findFirst({
                where: { workspaceId: flow.workspaceId, type: 'INSTAGRAM' }
            });

            if (!channel) {
                console.error(`[Automation] No Instagram channel found for workspace ${flow.workspaceId} when creating contact.`);
                return false;
            }

            contact = await this.prisma.contact.create({
                data: {
                    workspaceId: flow.workspaceId,
                    channels: {
                        create: {
                            channelId: channel.id,
                            externalId: contactId,
                            metadata: {}
                        }
                    },
                    customData: {}
                },
                include: { channels: true }
            });
        }

        // 1. Follow Check
        if (requireFollow) {
            const isFollower = (contact.customData as any)?.isFollower;
            if (!isFollower) {
                console.log(`[Automation] User ${contactId} must follow first.`);
                // Send Follow Request
                await this.sendFollowRequest(contactId, flow.workspaceId);

                // Save State
                await this.prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        customData: {
                            ...(contact.customData as any),
                            pendingFlowId: flow.id,
                            pendingMetadata: context.variables,
                            automationState: 'WAITING_FOR_FOLLOW'
                        }
                    }
                });
                return false;
            }
        }

        // 2. Email Check
        if (requireEmail) {
            if (!contact.email) {
                console.log(`[Automation] User ${contactId} must provide email.`);
                // Send Email Request
                await this.sendEmailRequest(contactId, flow.workspaceId);

                // Save State
                await this.prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        customData: {
                            ...(contact.customData as any || {}),
                            pendingFlowId: flow.id,
                            pendingMetadata: context.variables,
                            automationState: 'WAITING_FOR_EMAIL'
                        }
                    }
                });
                return false;
            }
        }

        return true;
    }

    async sendFollowRequest(contactId: string, workspaceId: string) {
        // Send a message with a "Done" button
        // We need to construct a Button Template message
        // Since `sendMessage` currently handles text, we need to bypass it or update it.
        // I'll implement a raw send here for simplicity.

        const channel = await this.prisma.channel.findFirst({
            where: { workspaceId, type: 'INSTAGRAM', isActive: true }
        });
        if (!channel) return;

        const accessToken = (channel.config as any).accessToken;
        const pageId = (channel.config as any).metaBusinessId;
        const url = `https://graph.instagram.com/v21.0/${pageId}/messages`;

        const payload = {
            recipient: { id: contactId },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "Please follow our page to continue.",
                        buttons: [
                            {
                                type: "postback",
                                title: "Done",
                                payload: "FOLLOW_CONFIRMED"
                            }
                        ]
                    }
                }
            }
        };

        try {
            await firstValueFrom(this.http.post(url, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }));
        } catch (e) {
            console.error('Failed to send follow request:', e.response?.data || e.message);
        }
    }

    async sendEmailRequest(contactId: string, workspaceId: string) {
        const channel = await this.prisma.channel.findFirst({
            where: { workspaceId, type: 'INSTAGRAM', isActive: true }
        });
        if (!channel) return;

        const accessToken = (channel.config as any).accessToken;
        const pageId = (channel.config as any).metaBusinessId;
        const url = `https://graph.instagram.com/v21.0/${pageId}/messages`;

        const payload = {
            recipient: { id: contactId },
            message: {
                text: "Please provide your email address to continue."
            }
        };

        try {
            await firstValueFrom(this.http.post(url, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }));
        } catch (e) {
            console.error('Failed to send email request:', e.response?.data || e.message);
        }
    }

    async trackClick(flowId: string, nodeId: string, contactId: string) {
        console.log(`[Automation] Tracking click for Flow ${flowId}, Node ${nodeId}, Contact ${contactId}`);

        // 1. Update Flow Stats
        await this.prisma.flowStats.upsert({
            where: { flowId },
            create: {
                flowId,
                clicks: 1,
            },
            update: {
                clicks: { increment: 1 },
            },
        });

        // 2. Log Event
        await this.prisma.automationLog.create({
            data: {
                flowId,
                workspaceId: (await this.getFlow(flowId)).workspaceId, // Fetching flow again might be expensive, but safe
                triggerType: 'LINK_CLICK',
                status: 'SUCCESS',
                message: `Link clicked by ${contactId}`,
                metadata: { nodeId },
            },
        });
    }

    private async sendMessage(node: FlowNode, context: ExecutionContext) {
        console.log(`[Automation] Sending Message: "${node.data.content}" to ${context.contactId}`);

        // 1. Get Channel Access Token
        // We assume the flow is associated with a specific channel type (INSTAGRAM)
        // In a real scenario, we might want to pass the specific channel ID in the context or flow
        const channel = await this.prisma.channel.findFirst({
            where: {
                workspaceId: context.workspaceId,
                type: 'INSTAGRAM',
                isActive: true,
            },
        });

        if (!channel || !channel.config || !(channel.config as any).accessToken) {
            console.error(`[Automation] No active Instagram channel found for workspace ${context.workspaceId}`);
            return;
        }

        const accessToken = (channel.config as any).accessToken;
        const pageId = (channel.config as any).metaBusinessId;

        // 2. Wrap Links for Tracking
        let messageText = node.data.content;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const apiUrl = this.config.get<string>('API_URL') || 'https://rexocialapi.rexcoders.in';

        messageText = messageText.replace(urlRegex, (url) => {
            const encodedUrl = encodeURIComponent(url);
            return `${apiUrl}/automation/track/${context.flowId}/${node.id}?contactId=${context.contactId}&url=${encodedUrl}`;
        });

        // 3. Send Message via Graph API
        try {
            const url = `https://graph.instagram.com/v21.0/${pageId}/messages`;

            // Construct payload based on node content
            let recipient: any = { id: context.contactId };

            // Handle Private Reply (if commentId exists in context)
            if (context.variables && context.variables.commentId) {
                recipient = { comment_id: context.variables.commentId };
            }

            const payload = {
                recipient,
                message: { text: messageText },
            };

            console.log(`[Automation] Payload:`, JSON.stringify(payload, null, 2));

            await firstValueFrom(this.http.post(url, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }));
            console.log(`[Automation] Message sent successfully to ${context.contactId}`);

            await this.prisma.automationLog.create({
                data: {
                    flowId: context.flowId,
                    workspaceId: context.workspaceId,
                    triggerType: 'ACTION',
                    status: 'SUCCESS',
                    message: `Sent DM to ${context.contactId}`,
                    metadata: { nodeId: node.id, content: messageText },
                },
            });
        } catch (error) {
            console.error(`[Automation] Failed to send message:`, error?.response?.data || error.message);

            await this.prisma.automationLog.create({
                data: {
                    flowId: context.flowId,
                    workspaceId: context.workspaceId,
                    triggerType: 'ACTION',
                    status: 'FAILED',
                    message: `Failed to send DM to ${context.contactId}`,
                    metadata: { error: error?.response?.data || error.message },
                },
            });
        }
    }
}
