"use client";

import { useRef, useEffect } from "react";
import FlowEditor, { FlowEditorRef } from "@/components/flow-builder/flow-editor";
import { useFlow, useUpdateFlow } from "@/hooks/use-flows";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useParams } from "next/navigation";

export default function FlowBuilderPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: flow, isLoading } = useFlow(id);
    const updateFlow = useUpdateFlow();
    const editorRef = useRef<FlowEditorRef>(null);

    const handleSave = async () => {
        if (!editorRef.current) return;
        
        const { nodes, edges } = editorRef.current.getFlow();
        
        try {
            await updateFlow.mutateAsync({
                id: id,
                data: {
                    nodes,
                    edges,
                },
            });
            toast.success("Flow saved successfully");
        } catch (error) {
            toast.error("Failed to save flow");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!flow) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Flow not found</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="h-16 border-b bg-white dark:bg-gray-900 flex items-center px-6 justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span>Automations</span>
                        <span className="mx-2">›</span>
                        <span className="font-medium text-foreground">{flow.name}</span>
                        <span className="ml-2 cursor-pointer hover:text-foreground">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                        </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wide ${flow.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                        {flow.isActive ? 'Active' : 'Draft'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center text-sm text-muted-foreground mr-4">
                        <span className="flex items-center text-green-600 mr-4">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Saved
                        </span>
                        <div className="flex gap-1">
                            <button 
                                className="p-1 hover:bg-gray-100 rounded active:bg-gray-200 transition-colors" 
                                onClick={() => editorRef.current?.undo()}
                                title="Undo (Ctrl+Z)"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 14L4 9l5-5" />
                                    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                                </svg>
                            </button>
                            <button 
                                className="p-1 hover:bg-gray-100 rounded active:bg-gray-200 transition-colors" 
                                onClick={() => editorRef.current?.redo()}
                                title="Redo (Ctrl+Y)"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'scaleX(-1)' }}>
                                    <path d="M9 14L4 9l5-5" />
                                    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center border rounded-lg overflow-hidden">
                        <Button variant="ghost" size="sm" className="h-9 px-3 border-r rounded-none gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                            Preview
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 px-2 rounded-none hover:bg-gray-50">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </Button>
                    </div>

                    <Button 
                        onClick={handleSave} 
                        disabled={updateFlow.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-6"
                    >
                        {updateFlow.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Set Live
                    </Button>

                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="editor" className="h-full flex flex-col">
                    <div className="border-b px-6 bg-white dark:bg-gray-900">
                        <TabsList>
                            <TabsTrigger value="editor">Editor</TabsTrigger>
                            <TabsTrigger value="logs">Logs</TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <TabsContent value="editor" className="flex-1 h-full mt-0 p-0">
                        <FlowEditor 
                            ref={editorRef}
                            initialNodes={flow.nodes} 
                            initialEdges={flow.edges} 
                        />
                    </TabsContent>
                    
                    <TabsContent value="logs" className="flex-1 h-full mt-0 p-6 overflow-auto">
                        <FlowLogs flowId={id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function FlowLogs({ flowId }: { flowId: string }) {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['flow-logs', flowId],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/automation/logs/${flowId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch logs');
            return res.json();
        },
        refetchInterval: 5000,
    });

    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs?.map((log: any) => (
                        <TableRow key={log.id}>
                            <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{log.triggerType}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                    log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {log.status}
                                </span>
                            </TableCell>
                            <TableCell>{log.message}</TableCell>
                        </TableRow>
                    ))}
                    {logs?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                No logs found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
