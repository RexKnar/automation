"use client";

import Link from "next/link";
import { Plus, MoreVertical, Play, Edit, Loader2, MessageCircle } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useFlows, useCreateFlow } from "@/hooks/use-flows";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

    // Auto-open create modal if no flows (optional interpretation of "take me to create new flow page")
    // For now, we'll just show the empty state which is clearer.

    const handleCreateFlow = async () => {
        if (!currentWorkspace) return;
        if (!newFlowName.trim()) {
            toast.error("Flow name is required");
            return;
        }

        try {
            const newFlow = await createFlow.mutateAsync({
                name: newFlowName,
                workspaceId: currentWorkspace.id,
            });
            toast.success("Flow created successfully");
            setIsCreateOpen(false);
            setNewFlowName("");
            
            if (channelId) {
                router.push(`/dashboard/${channelId}/automations/${newFlow.id}/edit`);
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
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Flow
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Flow</DialogTitle>
                            <DialogDescription>
                                Give your automation flow a name to get started.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newFlowName}
                                    onChange={(e) => setNewFlowName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g., Welcome Message"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateFlow} disabled={createFlow.isPending}>
                                {createFlow.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create
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
                        
                        const flowUrl = `/dashboard/${channelId}/automations/${flow.id}`;
                        const editUrl = `/dashboard/${channelId}/automations/${flow.id}/edit`;

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
