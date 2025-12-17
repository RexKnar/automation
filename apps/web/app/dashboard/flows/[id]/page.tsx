"use client";

import { useRef, useEffect } from "react";
import FlowEditor, { FlowEditorRef } from "@/components/flow-builder/flow-editor";
import { useFlow, useUpdateFlow } from "@/hooks/use-flows";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function FlowBuilderPage({ params }: { params: { id: string } }) {
    const { data: flow, isLoading } = useFlow(params.id);
    const updateFlow = useUpdateFlow();
    const editorRef = useRef<FlowEditorRef>(null);

    const handleSave = async () => {
        if (!editorRef.current) return;
        
        const { nodes, edges } = editorRef.current.getFlow();
        
        try {
            await updateFlow.mutateAsync({
                id: params.id,
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
                    <h1 className="text-lg font-semibold">{flow.name}</h1>
                    <span className="text-sm text-muted-foreground hidden md:inline-block">ID: {params.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${flow.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {flow.isActive ? 'Active' : 'Draft'}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleSave} 
                        disabled={updateFlow.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {updateFlow.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                    </Button>
                </div>
            </div>
            <div className="flex-1">
                <FlowEditor 
                    ref={editorRef}
                    initialNodes={flow.nodes} 
                    initialEdges={flow.edges} 
                />
            </div>
        </div>
    );
}
