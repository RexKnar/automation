"use client";

import Link from "next/link";
import { Plus, MoreVertical, Play, Edit, Loader2, MessageCircle, BarChart, Zap } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useFlows, useCreateFlow } from "@/hooks/use-flows";
import { useState } from "react";
import { AUTOMATION_TEMPLATES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useInstagramMedia } from "@/hooks/use-instagram-media";
import { useRouter } from "next/navigation";

export default function FlowsPage() {
    const router = useRouter();
    const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
    const currentWorkspace = workspaces?.[0]; // Default to first workspace for now
    const { data: flows, isLoading: isFlowsLoading } = useFlows(currentWorkspace?.id);
    const { data: mediaItems } = useInstagramMedia();
    const createFlow = useCreateFlow();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFlowName, setNewFlowName] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const handleCreateFlow = async () => {
        if (!currentWorkspace) return;
        if (!newFlowName.trim()) {
            toast.error("Flow name is required");
            return;
        }
        if (!selectedTemplateId) {
            toast.error("Please select a template");
            return;
        }

        let nodes: any[] = [];
        let edges: any[] = [];

        if (selectedTemplateId === "auto-send-links") {
            // Define nodes for "Auto-send links in DM"
            nodes = [
                {
                    id: 'trigger',
                    type: 'TRIGGER',
                    position: { x: 100, y: 300 },
                    data: { 
                        label: 'Trigger',
                        triggerType: 'KEYWORD',
                        keywordType: 'specific',
                        keywords: ['viral', 'video', 'viral video']
                    }
                },
                {
                    id: 'note_1',
                    type: 'NOTE',
                    position: { x: 100, y: 600 },
                    data: {
                        label: 'Your trigger here will be "User sends you a message". You can change these keywords to be anything you\'d like!'
                    }
                },
                {
                    id: 'note_2',
                    type: 'NOTE',
                    position: { x: 500, y: 150 },
                    data: {
                        label: 'This is the first message your follower receives with a Button that has a Link to your website.'
                    }
                },
                {
                    id: 'message_1',
                    type: 'MESSAGE',
                    position: { x: 500, y: 300 },
                    data: {
                        label: 'Send Message',
                        content: "Hey! 👋\n\nHere's a link to the viral video system that will help you crack the code on your next IG Reel or TikTok video!\n\nWant to check it out?",
                        buttons: [{ label: "Yes, please! 🔥", action: "next_step" }]
                    }
                },
                {
                    id: 'note_3',
                    type: 'NOTE',
                    position: { x: 900, y: 150 },
                    data: {
                        label: 'Make sure you update this button URL so it opens to your freebie PDF file!'
                    }
                },
                {
                    id: 'message_2',
                    type: 'MESSAGE',
                    position: { x: 900, y: 300 },
                    data: {
                        label: 'Send Message #3',
                        content: "Here you go! Check out the link 👇",
                        buttons: [{ label: "Get it here!", action: "link", url: "https://example.com" }],
                        delay: "60 sec..."
                    }
                },
                {
                    id: 'message_3',
                    type: 'MESSAGE',
                    position: { x: 900, y: 700 }, // Placed below for visual flow
                    data: {
                        label: 'Message 3',
                        content: "Did you have any questions about the video system? I'm here to help! ❤️"
                    }
                },
                {
                    id: 'note_4',
                    type: 'NOTE',
                    position: { x: 900, y: 900 },
                    data: {
                        label: "Here's your boop (aka your reminder after 1 minute). You can change the text!"
                    }
                }
            ];

            edges = [
                { id: 'e1', source: 'trigger', target: 'message_1' },
                { id: 'e2', source: 'message_1', target: 'message_2' },
                { id: 'e3', source: 'message_2', target: 'message_3' }
            ];
        }

        try {
            const newFlow = await createFlow.mutateAsync({
                name: newFlowName,
                workspaceId: currentWorkspace.id,
                nodes,
                edges
            });
            toast.success("Flow created successfully");
            setIsCreateOpen(false);
            setNewFlowName("");
            setSelectedTemplateId(null);
            
            if (selectedTemplateId === "auto-send-links") {
                router.push(`/dashboard/flows/${newFlow.id}`); // Visual Builder
            } else {
                const channelId = currentWorkspace.channels?.[0]?.id;
                if (channelId) {
                    router.push(`/dashboard/${channelId}/automations/${newFlow.id}/edit`);
                }
            }
        } catch (error) {
            toast.error("Failed to create flow");
        }
    };

    if (isWorkspacesLoading || isFlowsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!currentWorkspace) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">No workspace found</h2>
                <p className="text-muted-foreground">Please create a workspace first.</p>
            </div>
        );
    }

    // Helper to get channel ID for links (fallback to first channel)
    const defaultChannelId = currentWorkspace.channels?.[0]?.id;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Flows</h2>
                    <p className="text-muted-foreground mt-2">
                        Manage your automation flows for {currentWorkspace.name}.
                    </p>
                </div>
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Flow
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Flow</DialogTitle>
                            <DialogDescription>
                                Give your automation flow a name and choose a template to get started.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newFlowName}
                                    onChange={(e) => setNewFlowName(e.target.value)}
                                    placeholder="e.g., Welcome Message"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Choose a Template</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AUTOMATION_TEMPLATES.map((template) => (
                                        <Card 
                                            key={template.id}
                                            className={`cursor-pointer transition-all hover:shadow-md border-2 ${selectedTemplateId === template.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-transparent hover:border-indigo-200'}`}
                                            onClick={() => setSelectedTemplateId(template.id)}
                                        >
                                            <div className="p-4 flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                                                        <template.icon className="w-5 h-5" />
                                                    </div>
                                                    {template.tag && (
                                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none text-[10px]">
                                                            {template.tag}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-sm mb-1">{template.title}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                                    {template.description}
                                                </p>
                                                <div className="mt-auto flex items-center text-[10px] text-muted-foreground font-medium">
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    {template.type}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateFlow} disabled={createFlow.isPending}>
                                {createFlow.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Flow
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {flows?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <h3 className="text-lg font-medium text-muted-foreground">No flows yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">Create your first flow to start automating.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {flows?.map((flow) => {
                        // Find trigger node to get post ID
                        const triggerNode = flow.nodes?.find((n: any) => n.type === 'TRIGGER');
                        const postId = triggerNode?.data?.postId;
                        const media = postId ? mediaItems?.find((m: any) => m.id === postId) : null;
                        
                        // Construct URL
                        const isVisualFlow = flow.nodes?.some((n: any) => n.type === 'DELAY');
                        const flowUrl = defaultChannelId 
                            ? `/dashboard/${defaultChannelId}/automations/${flow.id}` 
                            : '#';
                        const editUrl = isVisualFlow
                            ? `/dashboard/flows/${flow.id}`
                            : (defaultChannelId 
                                ? `/dashboard/${defaultChannelId}/automations/${flow.id}/edit` 
                                : '#');

                                const editUrlNew = isVisualFlow
                            ? `/dashboard/flows/${flow.id}`
                            : `${flow.id}`;

                        return (
                            <div 
                                key={flow.id} 
                                className="border rounded-xl bg-card text-card-foreground shadow hover:border-indigo-500 transition cursor-pointer group relative overflow-hidden flex flex-col"
                                onClick={() => router.push(flowUrl)}
                            >
                                <div className="p-6 flex gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border relative">
                                        {media ? (
                                            <img 
                                                src={media.thumbnail_url || media.media_url} 
                                                alt="Post" 
                                                className="object-cover w-full h-full" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600">
                                                <MessageCircle className="w-6 h-6 opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 right-0 bg-black/60 p-0.5 rounded-tl-md">
                                            <Play className="w-3 h-3 text-white" fill="currentColor" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-lg truncate pr-2">{flow.name}</h3>
                                            <button className="text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {flow.triggerType || "No Trigger"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto border-t bg-muted/20 p-3 flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${flow.isActive
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {flow.isActive ? 'Active' : 'Draft'}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/dashboard/${defaultChannelId}/automations/${flow.id}/insights`}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center px-3 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Insights <BarChart className="w-3 h-3 ml-1" />
                                        </Link>
                                        <Link 
                                            href={editUrlNew} 
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center px-3 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Edit <Edit className="w-3 h-3 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
