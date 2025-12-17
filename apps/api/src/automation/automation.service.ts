import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlowGraph, ExecutionContext, FlowNode } from './types/flow.types';

@Injectable()
export class AutomationService {
    constructor(private prisma: PrismaService) { }

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

        const potentialFlows = await this.prisma.flow.findMany({
            where: {
                isActive: true,
                // triggerType: 'KEYWORD', // We are using KEYWORD for comment replies currently
            },
        });

        console.log(`[Automation] Found ${potentialFlows.length} active flows to check.`);

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

    async triggerFlow(flowId: string, contactId: string) {
        const flow = await this.getFlow(flowId);
        const nodes = flow.nodes as unknown as FlowNode[];

        // Find Start/Trigger Node
        const startNode = nodes.find(n => n.type === 'TRIGGER');
        if (!startNode) return;

        const context: ExecutionContext = {
            workspaceId: flow.workspaceId,
            contactId,
            flowId,
            variables: {},
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

    private async sendMessage(node: FlowNode, context: ExecutionContext) {
        // Placeholder for sending message via Meta API
        console.log(`[Mock] Sending Message: "${node.data.content}" to ${context.contactId}`);
    }
}
