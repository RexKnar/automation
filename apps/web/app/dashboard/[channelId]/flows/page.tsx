"use client";

import Link from "next/link";
import { Plus, MoreVertical, Play, Edit, Loader2, MessageCircle, Zap } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useFlows, useCreateFlow } from "@/hooks/use-flows";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ChannelFlowsPage() {
    const router = useRouter();
    const params = useParams();
    const channelId = params.channelId as string;

    const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
    
    // Find workspace and channel
    const currentWorkspace = workspaces?.find(w => w.channels?.some((c: any) => c.id === channelId));
    const currentChannel = currentWorkspace?.channels?.find((c: any) => c.id === channelId);

    const { data: flows, isLoading: isFlowsLoading } = useFlows(currentWorkspace?.id);
    const { data: mediaItems } = useInstagramMedia();
    const createFlow = useCreateFlow();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFlowName, setNewFlowName] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    // Auto-open create modal if no flows (optional interpretation of "take me to create new flow page")
    // For now, we'll just show the empty state which is clearer.

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

    if (!currentWorkspace || !currentChannel) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Channel not found</h2>
                <p className="text-muted-foreground">Please select a valid channel.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Flows</h2>
                    <p className="text-muted-foreground mt-2">
                        Manage automation flows for <span className="font-semibold text-foreground">{currentChannel.name}</span>
                    </p>
                </div>
                


    // ... render ...

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
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
                    <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <ZapIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium">No flows yet</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
                        Create your first automation flow to start engaging with your audience automatically.
                    </p>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Flow
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {flows?.map((flow) => {
                        const triggerNode = flow.nodes?.find((n: any) => n.type === 'TRIGGER');
                        const postId = triggerNode?.data?.postId;
                        const media = postId ? mediaItems?.find((m: any) => m.id === postId) : null;
                        
                        const isVisualFlow = flow.nodes?.some((n: any) => n.type === 'DELAY');
                        const flowUrl = `/dashboard/${channelId}/automations/${flow.id}`;
                        const editUrl = isVisualFlow
                            ? `/dashboard/flows/${flow.id}`
                            : `/dashboard/${channelId}/automations/${flow.id}/edit`;

                        return (
                            <div 
                                key={flow.id} 
                                className="border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col"
                                onClick={() => router.push(flowUrl)}
                            >
                                <div className="p-6 flex gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border relative">
                                        {media ? (
                                            <img 
                                                src={media.thumbnail_url || media.media_url} 
                                                alt="Post" 
                                                className="object-cover w-full h-full" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                                                <MessageCircle className="w-6 h-6 opacity-50" />
                                            </div>
                                        )}
                                        {media && (
                                            <div className="absolute bottom-0 right-0 bg-black/60 p-0.5 rounded-tl-md">
                                                <Play className="w-3 h-3 text-white" fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-lg truncate pr-2">{flow.name}</h3>
                                            <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {flow.triggerType === 'KEYWORD' ? 'Keyword Trigger' : 
                                             flow.triggerType === 'COMMENT' ? 'Comment Trigger' : 
                                             flow.triggerType || "No Trigger"}
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
                                    <Link 
                                        href={editUrl} 
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center px-3 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Edit <Edit className="w-3 h-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ZapIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    )
}
