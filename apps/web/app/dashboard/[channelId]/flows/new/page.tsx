"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useCreateFlow } from "@/hooks/use-flows";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, MessageSquare, Users, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: "new-followers",
    title: "Say hi to new followers",
    description: "Send new followers a one-time welcome message when they hit follow",
    icon: Users,
    type: "Quick Automation",
    tag: "NEW",
    category: "Grow your followers"
  },
  {
    id: "auto-dm",
    title: "Auto-DM links from comments",
    description: "Send a link when people comment on a post or reel",
    icon: MessageSquare,
    type: "Quick Automation",
    tag: "POPULAR",
    category: "Drive traffic"
  },
  {
    id: "story-leads",
    title: "Generate leads with stories",
    description: "Use limited-time offers in your Stories to convert leads",
    icon: TrendingUp,
    type: "Quick Automation",
    category: "Engage your audience"
  },
  {
    id: "auto-send-links",
    title: "Auto-send links in DM",
    description: "Automate DMs to send followers to your website",
    icon: MessageSquare,
    type: "Flow Builder",
    category: "Drive traffic"
  }
];

export default function NewFlowPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const channelId = params.channelId as string;
    const flowName = searchParams.get("name");

    const { data: workspaces } = useWorkspaces();
    const createFlow = useCreateFlow();
    const [search, setSearch] = useState("");

    // Find workspace
    const currentWorkspace = workspaces?.find(w => w.channels?.some((c: any) => c.id === channelId));

    const handleSelectTemplate = async (templateId: string) => {
        if (!currentWorkspace || !flowName) {
            toast.error("Missing workspace or flow name");
            return;
        }

        let nodes: any[] = [];
        let edges: any[] = [];

        if (templateId === "auto-send-links") {
            // Define nodes for "Auto-send links in DM"
            nodes = [
                {
                    id: 'trigger',
                    type: 'TRIGGER',
                    position: { x: 100, y: 100 },
                    data: { 
                        label: 'Trigger',
                        triggerType: 'KEYWORD',
                        keywordType: 'specific',
                        keywords: []
                    }
                },
                {
                    id: 'message_1',
                    type: 'MESSAGE',
                    position: { x: 100, y: 300 },
                    data: {
                        label: 'Message 1',
                        content: "Hey! 👋\n\nHere's a link to the viral video system that will help you crack the code on your next IG Reel or TikTok video!\n\nWant to check it out?",
                        buttons: [{ label: "Yes, please! 🔥", action: "next_step" }]
                    }
                },
                {
                    id: 'message_2',
                    type: 'MESSAGE',
                    position: { x: 100, y: 500 },
                    data: {
                        label: 'Message 2',
                        content: "Here you go! Check out the link 👇",
                        buttons: [{ label: "Get it here!", action: "link", url: "https://example.com" }]
                    }
                },
                {
                    id: 'delay_1',
                    type: 'DELAY',
                    position: { x: 100, y: 700 },
                    data: {
                        label: 'Delay',
                        duration: 60,
                        unit: 'seconds'
                    }
                },
                {
                    id: 'message_3',
                    type: 'MESSAGE',
                    position: { x: 100, y: 900 },
                    data: {
                        label: 'Message 3',
                        content: "Did you have any questions about the video system? I'm here to help! ❤️"
                    }
                }
            ];

            edges = [
                { id: 'e1', source: 'trigger', target: 'message_1' },
                { id: 'e2', source: 'message_1', target: 'message_2' },
                { id: 'e3', source: 'message_2', target: 'delay_1' },
                { id: 'e4', source: 'delay_1', target: 'message_3' }
            ];
        }

        try {
            const newFlow = await createFlow.mutateAsync({
                name: flowName,
                workspaceId: currentWorkspace.id,
                nodes,
                edges
            });
            
            toast.success("Flow created successfully");
            
            // Redirect based on template type
            if (templateId === "auto-send-links") {
                router.push(`/dashboard/flows/${newFlow.id}`); // Visual Builder
            } else {
                router.push(`/dashboard/${channelId}/automations/${newFlow.id}/edit`); // Standard Builder
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create flow");
        }
    };

    const filteredTemplates = TEMPLATES.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Choose a Template</h1>
                        <p className="text-gray-400">Select a template to get started with <span className="text-white font-semibold">{flowName}</span></p>
                    </div>
                </div>
                
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search templates..." 
                        className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-white/10 p-4 space-y-6 overflow-y-auto hidden md:block">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">By goal</h3>
                        <div className="space-y-1">
                            {["Grow your followers", "Engage your audience", "Drive traffic"].map((item) => (
                                <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-black/20">
                    <h2 className="text-xl font-bold mb-4">Recommended</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template) => (
                            <Card 
                                key={template.id}
                                className="bg-white text-slate-900 border-none hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => handleSelectTemplate(template.id)}
                            >
                                <div className="p-6 h-full flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">
                                            {template.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {template.description}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <Zap className="h-3 w-3" />
                                            {template.type}
                                        </div>
                                        {template.tag && (
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                                                {template.tag}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {createFlow.isPending && (
                                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
