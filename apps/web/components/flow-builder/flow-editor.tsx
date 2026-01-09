"use client";

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  updateEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NodeSidebar } from './node-sidebar';
import { TriggerNode } from './nodes/trigger-node';
import { MessageNode } from './nodes/message-node';
import { NoteNode } from './nodes/note-node';

const nodeTypes = {
  TRIGGER: TriggerNode,
  MESSAGE: MessageNode,
  NOTE: NoteNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

import { useUndoRedo } from '@/hooks/use-undo-redo';
import { useEffect } from 'react';

// ... (imports)

export interface FlowEditorRef {
    getFlow: () => { nodes: Node[]; edges: Edge[] };
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

interface FlowEditorProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
}

import { NodeSelector } from './node-selector';
import { NodeConfigSidebar } from './node-config-sidebar';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ... (imports)

const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>(({ initialNodes = [], initialEdges = [] }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo(nodes, edges);

  const handleUndo = useCallback(() => {
    const previous = undo(nodes, edges);
    if (previous) {
      setNodes(previous.nodes);
      setEdges(previous.edges);
    }
  }, [undo, nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const next = redo(nodes, edges);
    if (next) {
      setNodes(next.nodes);
      setEdges(next.edges);
    }
  }, [redo, nodes, edges, setNodes, setEdges]);

  useImperativeHandle(ref, () => ({
      getFlow: () => {
          if (reactFlowInstance) {
              return reactFlowInstance.toObject();
          }
          return { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } };
      },
      undo: handleUndo,
      redo: handleRedo,
      canUndo,
      canRedo
  }));

  const onConnect = useCallback(
    (params: Connection | Edge) => {
        takeSnapshot(nodes, edges);
        setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, takeSnapshot, nodes, edges],
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
        takeSnapshot(nodes, edges);
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    [setEdges, takeSnapshot, nodes, edges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleUpdateNode = useCallback((id: string, data: any) => {
    takeSnapshot(nodes, edges);
    setNodes((nds) => nds.map((node) => {
        if (node.id === id) {
            return { ...node, data };
        }
        return node;
    }));
  }, [setNodes, takeSnapshot, nodes, edges]);

  const handleDeleteNode = useCallback((id: string) => {
    takeSnapshot(nodes, edges);
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setSelectedNodeId(null);
  }, [setNodes, takeSnapshot, nodes, edges]);

  const handleNodeSelect = useCallback((type: string) => {
    if (!reactFlowInstance) return;
    takeSnapshot(nodes, edges);

    const position = reactFlowInstance.project({
        x: reactFlowWrapper.current?.clientWidth! / 2 - 150,
        y: reactFlowWrapper.current?.clientHeight! / 2,
    });

    const newNode: Node = {
        id: getId(),
        type: type,
        position,
        data: { 
            label: type === 'TRIGGER' ? 'New Trigger' : 
                   type === 'MESSAGE' ? 'New Message' : 
                   type === 'NOTE' ? 'New Note' : `${type} Node`,
            content: type === 'MESSAGE' ? 'Enter your message here...' : undefined
        },
    };

    setNodes((nds) => nds.concat(newNode));
    setIsNodeSelectorOpen(false);
  }, [reactFlowInstance, setNodes, takeSnapshot, nodes, edges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
            event.preventDefault();
            if (event.shiftKey) {
                handleRedo();
            } else {
                handleUndo();
            }
        } else if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
            event.preventDefault();
            handleRedo();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const onEdgesChangeWrapped = useCallback((changes: any) => {
    const isDeletion = changes.some((c: any) => c.type === 'remove');
    if (isDeletion) {
        takeSnapshot(nodes, edges);
    }
    onEdgesChange(changes);
  }, [onEdgesChange, takeSnapshot, nodes, edges]);

  const onNodesChangeWrapped = useCallback((changes: any) => {
    const isDeletion = changes.some((c: any) => c.type === 'remove');
    if (isDeletion) {
        takeSnapshot(nodes, edges);
    }
    onNodesChange(changes);
  }, [onNodesChange, takeSnapshot, nodes, edges]);

  const onNodeDragStart = useCallback(() => {
    takeSnapshot(nodes, edges);
  }, [takeSnapshot, nodes, edges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      takeSnapshot(nodes, edges);

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      }) || { x: 0, y: 0 };
      
      const newNode: Node = {
        id: getId(),
        type: type === 'TRIGGER' ? 'input' : 'default', // Mapping to ReactFlow types for now
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  return (
    <div className="flex h-full w-full relative">
      <ReactFlowProvider>
        {/* <NodeSidebar /> - Hiding sidebar in favor of new selector */}
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWrapped}
            onEdgesChange={onEdgesChangeWrapped}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onNodeDragStart={onNodeDragStart}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
          
          {/* Floating Action Button */}
          <div className="absolute top-4 right-4 z-40">
            <Button 
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg p-0 flex items-center justify-center"
                onClick={() => setIsNodeSelectorOpen(!isNodeSelectorOpen)}
            >
                <Plus className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* Node Selector */}
          <NodeSelector 
            isOpen={isNodeSelectorOpen} 
            onClose={() => setIsNodeSelectorOpen(false)}
            onSelect={handleNodeSelect}
          />

          {/* Node Config Sidebar */}
          <NodeConfigSidebar 
            node={nodes.find(n => n.id === selectedNodeId) || null}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
          />
        </div>
      </ReactFlowProvider>
    </div>
  );
});

FlowEditor.displayName = "FlowEditor";

export default FlowEditor;
