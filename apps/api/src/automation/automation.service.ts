import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MetaService } from '../meta/meta.service';
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
        @Inject(forwardRef(() => MetaService))
        private metaService: MetaService,
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

        // Debug: Check Trigger Node Data
        if (data.nodes) {
            const triggerNode = data.nodes.find((n: any) => n.type === 'TRIGGER');
            const followNode = data.nodes.find((n: any) => n.id.includes('request_follow_dm') || n.data.messageType === 'request_follow_dm');

            if (triggerNode) {
                console.log(`[Automation] Creating Flow - Trigger Data:`, JSON.stringify(triggerNode.data, null, 2));
            }
            if (followNode) {
                console.log(`[Automation] Creating Flow - Follow Node Found:`, JSON.stringify(followNode, null, 2));
            } else {
                console.log(`[Automation] Creating Flow - No Follow Node found.`);
            }
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
        // Debug: Check Trigger Node Data on Update
        if (data.nodes) {
            const triggerNode = data.nodes.find((n: any) => n.type === 'TRIGGER');
            const followNode = data.nodes.find((n: any) => n.id.includes('request_follow_dm') || n.data.messageType === 'request_follow_dm');

            if (triggerNode) {
                console.log(`[Automation] Updating Flow ${id} - Trigger Data:`, JSON.stringify(triggerNode.data, null, 2));
            }
            if (followNode) {
                console.log(`[Automation] Updating Flow ${id} - Follow Node Found:`, JSON.stringify(followNode, null, 2));
            }
        }

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

    async getFlowStats(flowId: string) {
        const logs = await this.prisma.automationDeliveryLog.findMany({
            where: { flowId },
        });

        const stats = {
            totalTriggered: logs.length,
            followMsgSent: logs.filter(l => l.followMsgSent).length,
            followConfirmed: logs.filter(l => l.followConfirmed).length,
            openingMsgSent: logs.filter(l => l.openingMsgSent).length,
            openingClicked: logs.filter(l => l.openingClicked).length,
            emailReqSent: logs.filter(l => l.emailReqSent).length,
            emailProvided: logs.filter(l => l.emailProvided).length,
            linkMsgSent: logs.filter(l => l.linkMsgSent).length,
            linkClicked: logs.filter(l => l.linkClicked).length,
        };

        return stats;
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

            await this.runFlow(flow.id, data.fromId, { commentId: data.commentId }, true); // isNewExecution: true
        }
    }

    // Wrapper to check gates before triggering
    async runFlow(flowId: string, externalId: string, metadata?: any, isNewExecution: boolean = false) {
        const flow = await this.getFlow(flowId);

        // 1. Resolve Contact
        let contact = await this.prisma.contact.findFirst({
            where: {
                channels: {
                    some: {
                        externalId: externalId,
                        channel: { type: 'INSTAGRAM' }
                    }
                }
            },
            include: { channels: { include: { channel: true } } }
        });

        if (!contact) {
            // Create Contact if missing (Lazy creation)
            const channel = await this.prisma.channel.findFirst({
                where: { workspaceId: flow.workspaceId, type: 'INSTAGRAM' }
            });

            if (channel) {
                contact = await this.prisma.contact.create({
                    data: {
                        workspaceId: flow.workspaceId,
                        channels: {
                            create: { channelId: channel.id, externalId: externalId, metadata: {} }
                        },
                        customData: {}
                    },
                    include: { channels: { include: { channel: true } } }
                });
            } else {
                console.error(`[Automation] No Instagram channel found for workspace ${flow.workspaceId}`);
                return;
            }
        }

        const canProceed = await this.checkGates(flow, contact, { variables: metadata }, isNewExecution);

        if (canProceed) {
            console.log(`[Automation] Gates passed for Flow ${flow.name}. Executing...`);
            await this.triggerFlow(flowId, contact.id, externalId, metadata);
        } else {
            console.log(`[Automation] Flow ${flow.name} gated/paused.`);
        }
    }

    async handleIncomingMessage(data: {
        text: string;
        messageId: string;
        fromId: string;
        isPostback?: boolean;
        payload?: string;
    }) {
        console.log(`[Automation] Handling Message from ${data.fromId}: "${data.text}" (Postback: ${data.isPostback})`);

        // 1. Identify Contact & Flow Context
        const contact = await this.prisma.contact.findFirst({
            where: {
                channels: {
                    some: {
                        externalId: data.fromId,
                        channel: { type: 'INSTAGRAM' }
                    }
                }
            },
            include: { channels: true }
        });

        if (!contact) {
            // New contact, likely starting a flow via keyword
            // Fallthrough to Keyword check
        } else {
            // Check for Pending Flow (Priority)
            // Check for Pending Flow or Payload Flow ID
            let flowId = (contact.customData as any)?.pendingFlowId;
            let action = '';

            const text = data.text?.toLowerCase() || '';
            let payload = data.payload || '';

            // Parse Unique Payload (ACTION:FLOW_ID)
            if (payload.includes(':')) {
                const parts = payload.split(':');
                action = parts[0].toLowerCase();
                flowId = parts[1]; // Override pending flow ID if present in payload
            } else {
                action = payload.toLowerCase();
            }

            console.log(`[Automation] Parsed Payload: Action="${action}", FlowId="${flowId}", OriginalPayload="${payload}"`);

            if (flowId) {
                const flow = await this.getFlow(flowId);
                const log = await this.getOrCreateDeliveryLog(flow.id, contact.id, flow.workspaceId);

                if (action === 'follow_confirmed' || text === 'followed') {
                    console.log(`[Automation] Follow Confirmed for Flow ${flowId}`);
                    await this.prisma.contact.update({
                        where: { id: contact.id },
                        data: {
                            customData: { ...(contact.customData as any), isFollower: true }
                        }
                    });
                    await this.prisma.automationDeliveryLog.update({
                        where: { id: log.id },
                        data: { followConfirmed: true }
                    });
                    // Resume
                    await this.runFlow(flow.id, data.fromId, (contact.customData as any).pendingMetadata, false);
                    return;
                }

                if (action === 'send_link' || action === 'send_link_click' || text === 'send_link') {
                    console.log(`[Automation] Opening Button Clicked for Flow ${flowId}`);
                    await this.prisma.automationDeliveryLog.update({
                        where: { id: log.id },
                        data: { openingClicked: true }
                    });
                    // Resume
                    await this.runFlow(flow.id, data.fromId, (contact.customData as any).pendingMetadata, false);
                    return;
                }

                // Handle Email Input
                if ((contact.customData as any)?.automationState === 'WAITING_FOR_EMAIL') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(data.text.trim())) {
                        await this.prisma.contact.update({
                            where: { id: contact.id },
                            data: {
                                email: data.text.trim(),
                                customData: {
                                    ...(contact.customData as any),
                                    automationState: null, // Clear state
                                }
                            }
                        });
                        await this.prisma.automationDeliveryLog.update({
                            where: { id: log.id },
                            data: { emailProvided: true }
                        });
                        // Resume
                        await this.runFlow(flow.id, data.fromId, (contact.customData as any).pendingMetadata);
                        return;
                    } else {
                        // Invalid Email - Ask again (optional, or just ignore)
                        // For now, let's re-send request if needed or just wait
                        return;
                    }
                }
            }
        }

        // 2. Find all active flows triggered by KEYWORD (if not handling pending)
        const potentialFlows = await this.prisma.flow.findMany({
            where: {
                isActive: true,
                triggerType: 'KEYWORD',
            },
        });

        for (const flow of potentialFlows) {
            const nodes = flow.nodes as unknown as FlowNode[];
            const triggerNode = nodes.find(n => n.type === 'TRIGGER');
            if (!triggerNode) continue;

            const keywords = triggerNode.data.keywords || [];
            const messageText = data.text.toLowerCase();
            const hasKeyword = keywords.some((k: string) => messageText.includes(k.toLowerCase()));

            if (hasKeyword) {
                console.log(`[Automation] Flow "${flow.name}" matched! Triggering...`);

                // Initial Log
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

                await this.runFlow(flow.id, data.fromId, {}, true); // isNewExecution: true
                // Only trigger one flow per keyword match? For now, yes.
                break;
            }
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

    async triggerFlow(flowId: string, contactId: string, externalId?: string, metadata?: any) {
        const flow = await this.getFlow(flowId);
        const nodes = flow.nodes as unknown as FlowNode[];

        // Find Start/Trigger Node
        const startNode = nodes.find(n => n.type === 'TRIGGER');
        if (!startNode) return;

        const context: ExecutionContext = {
            workspaceId: flow.workspaceId,
            contactId, // Internal UUID
            externalId, // Platform ID (PSID)
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
        const isGateNode = node.id.includes('request_follow_dm') ||
            node.data.messageType === 'request_follow_dm' ||
            node.id.includes('opening_dm') ||
            node.data.messageType === 'opening_dm';

        if (isGateNode) {
            console.log(`[Automation] Skipping Gate Node Execution (Handled by checkGates): ${node.id}`);
        } else {
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

    async handleFollowConfirmation(contactId: string, flowId?: string) {
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

        if (!contact) {
            console.log('[Automation] Contact not found for follow confirmation.');
            return;
        }

        // Priority: Payload Flow ID > Pending Flow ID
        const targetFlowId = flowId || (contact.customData as any)?.pendingFlowId;
        const metadata = (contact.customData as any)?.pendingMetadata || {};

        if (!targetFlowId) {
            console.log('[Automation] No pending flow found for follow confirmation.');
            return;
        }

        // 2. Clear pending state & Mark as Follower
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

        // Update Log
        const log = await this.getOrCreateDeliveryLog(targetFlowId, contact.id, (contact.customData as any)?.pendingMetadata?.workspaceId);
        if (log) {
            await this.prisma.automationDeliveryLog.update({
                where: { id: log.id },
                data: { followConfirmed: true }
            });
        }

        // 3. Resume Flow
        console.log(`[Automation] Resuming Flow ${targetFlowId} for Contact ${contact.id}`);
        await this.runFlow(targetFlowId, contactId, metadata);
    }

    async checkGates(flow: any, contact: any, context: any, isNewExecution: boolean = false): Promise<boolean> {
        const nodes = flow.nodes as unknown as FlowNode[];
        const triggerNode = nodes.find(n => n.type === 'TRIGGER');
        if (!triggerNode) return true;



        // Resolve externalId for sending messages
        const channel = contact.channels.find((c: any) => c.channel && c.channel.type === 'INSTAGRAM');
        const externalId = channel?.externalId;

        if (!externalId) {
            console.error(`[Automation] No external ID found for contact ${contact.id}`);
            return false;
        }

        // Detect Gate Configuration from Nodes
        const followNode = nodes.find(n => n.id.toLowerCase().includes('request_follow_dm') || n.data.messageType === 'request_follow_dm');
        const openingNode = nodes.find(n => n.id.toLowerCase().includes('opening_dm') || n.data.messageType === 'opening_dm');
        const emailNode = nodes.find(n => n.id.toLowerCase().includes('email_request_dm') || n.data.messageType === 'email_request_dm');

        const requireFollow = !!followNode || triggerNode.data.requireFollow;
        const openingDM = !!openingNode || triggerNode.data.openingDM;
        const requireEmail = !!emailNode || triggerNode.data.requireEmail;

        const openingDMText = openingNode?.data?.content || triggerNode.data.openingDMText;
        const replyButtonText = openingNode?.data?.buttons?.[0]?.label || triggerNode.data.replyButtonText;
        const followDMText = followNode?.data?.content || "Please follow our page to continue.";

        // Get Delivery Log
        const log = await this.getOrCreateDeliveryLog(flow.id, contact.id, flow.workspaceId, isNewExecution);

        // 1. Follow Check
        if (requireFollow) {
            let isFollower = (contact.customData as any)?.isFollower || log.followConfirmed;
            console.log(`[Automation] Follow Check: Contact ${contact.id}, isFollower=${isFollower}, log.followConfirmed=${log.followConfirmed}`);

            if (!isFollower) {
                // Try to verify via API
                const channel = await this.prisma.channel.findFirst({
                    where: { workspaceId: flow.workspaceId, type: 'INSTAGRAM', isActive: true }
                });

                if (channel && channel.config && (channel.config as any).accessToken) {
                    const pageId = (channel.config as any).metaBusinessId;
                    const accessToken = (channel.config as any).accessToken;

                    const apiIsFollower = await this.metaService.checkInstagramFollow(externalId, pageId, accessToken);

                    if (apiIsFollower) {
                        console.log(`[Automation] API confirmed user ${externalId} is following.`);
                        isFollower = true;

                        // Update Contact
                        await this.prisma.contact.update({
                            where: { id: contact.id },
                            data: {
                                customData: { ...(contact.customData as any), isFollower: true }
                            }
                        });
                    }
                }
            }

            if (!isFollower) {
                if (!log.followMsgSent) {
                    console.log(`[Automation] Sending Follow Request to ${externalId}`);
                    const sent = await this.sendButtonMessage(externalId, flow.workspaceId, followDMText, [
                        { type: 'postback', title: 'Done', payload: `FOLLOW_CONFIRMED:${flow.id}` }
                    ]);

                    if (sent) {
                        await this.prisma.automationDeliveryLog.update({
                            where: { id: log.id },
                            data: { followMsgSent: true }
                        });
                    } else {
                        console.error(`[Automation] Failed to send Follow Request to ${externalId}`);
                        // Do not return false here, maybe we should retry or just stop?
                        // If we return false, we stop. If we continue, we skip the gate (bad).
                        // So we return false, effectively blocking the flow until it works.
                        return false;
                    }
                }
                // Save Pending State
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

        // 2. Opening Message (with "Send me the link" button)
        if (openingDM) {
            if (!log.openingClicked) {
                if (!log.openingMsgSent) {
                    console.log(`[Automation] Sending Opening Message to ${externalId}`);
                    const text = openingDMText || "Hey there! Click below to get the link.";
                    const btnText = replyButtonText || "Send me the link";

                    await this.sendButtonMessage(externalId, flow.workspaceId, text, [
                        { type: 'postback', title: btnText, payload: `SEND_LINK:${flow.id}` }
                    ]);

                    await this.prisma.automationDeliveryLog.update({
                        where: { id: log.id },
                        data: { openingMsgSent: true }
                    });
                }
                // Wait for click
                await this.prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        customData: {
                            ...(contact.customData as any),
                            pendingFlowId: flow.id,
                            pendingMetadata: context.variables,
                            automationState: 'WAITING_FOR_OPENING_CLICK'
                        }
                    }
                });
                return false;
            }
        }

        // 3. Email Check
        if (requireEmail) {
            if (!contact.email && !log.emailProvided) {
                if (!log.emailReqSent) {
                    console.log(`[Automation] Sending Email Request to ${externalId}`);
                    await this.sendEmailRequest(externalId, flow.workspaceId);
                    await this.prisma.automationDeliveryLog.update({
                        where: { id: log.id },
                        data: { emailReqSent: true }
                    });
                }
                // Wait for email
                await this.prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        customData: {
                            ...(contact.customData as any),
                            pendingFlowId: flow.id,
                            pendingMetadata: context.variables,
                            automationState: 'WAITING_FOR_EMAIL'
                        }
                    }
                });
                return false;
            }
        }

        // All gates passed!
        return true;
    }

    async sendButtonMessage(contactId: string, workspaceId: string, text: string, buttons: any[]): Promise<boolean> {
        const channel = await this.prisma.channel.findFirst({
            where: { workspaceId, type: 'INSTAGRAM', isActive: true }
        });
        if (!channel) return false;

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
                        text: text,
                        buttons: buttons
                    }
                }
            }
        };

        try {
            await firstValueFrom(this.http.post(url, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }));
            return true;
        } catch (e) {
            console.error('Failed to send button message:', e.response?.data || e.message);
            return false;
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

    async getOrCreateDeliveryLog(flowId: string, contactId: string, workspaceId: string, forceNew: boolean = false) {
        if (forceNew) {
            // Cancel existing in-progress logs
            // Assuming we don't have a status field yet, but if we did, we'd update it.
            // For now, just creating a new one effectively "resets" the state for this flow run.
            // We could also update the contact's pendingFlowId to null before this, but runFlow handles overwriting it.
        }

        let log = await this.prisma.automationDeliveryLog.findFirst({
            where: { flowId, contactId },
            orderBy: { createdAt: 'desc' }
        });

        if (!log || forceNew) {
            log = await this.prisma.automationDeliveryLog.create({
                data: { flowId, contactId, workspaceId }
            });
        }
        return log;
    }

    async trackClick(flowId: string, nodeId: string, contactId: string) {
        console.log(`[Automation] Tracking click for Flow ${flowId}, Node ${nodeId}, Contact ${contactId}`);

        // 1. Update Flow Stats
        await this.prisma.flowStats.upsert({
            where: { flowId },
            create: { flowId, clicks: 1 },
            update: { clicks: { increment: 1 } },
        });

        // 2. Update Delivery Log
        const log = await this.prisma.automationDeliveryLog.findFirst({
            where: { flowId, contactId },
            orderBy: { createdAt: 'desc' }
        });
        if (log) {
            await this.prisma.automationDeliveryLog.update({
                where: { id: log.id },
                data: { linkClicked: true }
            });
        }

        // 3. Log Event
        await this.prisma.automationLog.create({
            data: {
                flowId,
                workspaceId: (await this.getFlow(flowId)).workspaceId,
                triggerType: 'LINK_CLICK',
                status: 'SUCCESS',
                message: `Link clicked by ${contactId}`,
                metadata: { nodeId },
            },
        });
    }

    private async sendMessage(node: FlowNode, context: ExecutionContext) {
        console.log(`[Automation] Sending Message: "${node.data.content}" to ${context.contactId}`);

        const channel = await this.prisma.channel.findFirst({
            where: { workspaceId: context.workspaceId, type: 'INSTAGRAM', isActive: true },
        });

        if (!channel || !channel.config || !(channel.config as any).accessToken) {
            console.error(`[Automation] No active Instagram channel found for workspace ${context.workspaceId}`);
            return;
        }

        const accessToken = (channel.config as any).accessToken;
        const pageId = (channel.config as any).metaBusinessId;

        // Resolve External ID (PSID)
        let recipientId = context.externalId;
        if (!recipientId) {
            // Try to fetch from DB if not in context
            const contact = await this.prisma.contact.findUnique({
                where: { id: context.contactId },
                include: { channels: { include: { channel: true } } }
            });
            const contactChannel = contact?.channels.find(c => c.channel.type === 'INSTAGRAM');
            recipientId = contactChannel?.externalId;
        }

        if (!recipientId) {
            console.error(`[Automation] Could not resolve External ID for Contact ${context.contactId}`);
            return;
        }

        // 2. Wrap Links for Tracking
        let messageText = node.data.content;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const apiUrl = this.config.get<string>('API_URL') || 'https://rexocialapi.rexcoders.in';

        // Check if we should send as Button Template (if it's the final link message)
        // The user said: "finally send the link with our message if possible link the link with a button"
        // If the message contains a link, we can convert it to a button template.

        try {
            const url = `https://graph.instagram.com/v21.0/${pageId}/messages`;
            let recipient: any = { id: recipientId };

            if (context.variables && context.variables.commentId) {
                recipient = { comment_id: context.variables.commentId };
            }

            const links = messageText.match(urlRegex);

            let payload: any;
            const lowerText = messageText.toLowerCase();
            const nodeId = node.id.toLowerCase();
            const messageType = node.data.messageType || '';

            // Determine Message Type based on ID or Data
            const dmLink = node.data.dm_link;
            const isLinkDM = nodeId.includes('link_dm') || messageType === 'link_dm' || !!dmLink || (links && links.length > 0);
            const isOpeningDM = nodeId.includes('opening_dm') || messageType === 'opening_dm';
            const isFollowDM = nodeId.includes('request_follow_dm') || messageType === 'request_follow_dm' || lowerText.includes('follow');

            if (isLinkDM && (dmLink || (links && links.length > 0))) {
                // 1. Link Message
                const linkUrl = dmLink || links[0];
                const cleanText = dmLink ? messageText : (messageText.replace(linkUrl, '').trim() || "Click the button below:");
                const encodedUrl = encodeURIComponent(linkUrl);
                const trackingUrl = `${apiUrl}/automation/track/${context.flowId}/${node.id}?contactId=${context.contactId}&url=${encodedUrl}`;

                payload = {
                    recipient,
                    message: {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "button",
                                text: cleanText,
                                buttons: [
                                    {
                                        type: "web_url",
                                        url: trackingUrl,
                                        title: node.data.dmLinkText || "Open the link"
                                    }
                                ]
                            }
                        }
                    }
                };
            } else if (isFollowDM) {
                // 2. Ask to Follow Message
                payload = {
                    recipient,
                    message: {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "button",
                                text: messageText,
                                buttons: [
                                    {
                                        type: "postback",
                                        payload: `follow_confirmed:${context.flowId}`,
                                        title: "Followed"
                                    }
                                ]
                            }
                        }
                    }
                };
            } else if (isOpeningDM) {
                // 3. Opening Message (Send Link)
                payload = {
                    recipient,
                    message: {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "button",
                                text: messageText,
                                buttons: [
                                    {
                                        type: "postback",
                                        payload: `send_link_click:${context.flowId}`,
                                        title: "Send_Link"
                                    }
                                ]
                            }
                        }
                    }
                };
            } else {
                // 4. Standard Text Message
                payload = {
                    recipient,
                    message: { text: messageText }
                };
            }

            await firstValueFrom(this.http.post(url, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }));
            console.log(`[Automation] Message sent successfully to ${context.contactId}`);

            // Update Log
            const log = await this.getOrCreateDeliveryLog(context.flowId, context.contactId, context.workspaceId);
            await this.prisma.automationDeliveryLog.update({
                where: { id: log.id },
                data: { linkMsgSent: true } // Assuming this is the final message
            });

            // If this was the Link Message (Final Step), Clear Pending State
            if (isLinkDM) {
                console.log(`[Automation] Flow ${context.flowId} Completed for Contact ${context.contactId}. Clearing state.`);
                const currentContact = await this.prisma.contact.findUnique({ where: { id: context.contactId } });

                if (currentContact) {
                    await this.prisma.contact.update({
                        where: { id: context.contactId },
                        data: {
                            customData: {
                                ...(currentContact.customData as any),
                                pendingFlowId: null,
                                pendingMetadata: null,
                                automationState: 'COMPLETED'
                            }
                        }
                    });
                }
            }

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
