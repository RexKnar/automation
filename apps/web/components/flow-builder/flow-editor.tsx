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
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NodeSidebar } from './node-sidebar';

let id = 0;
const getId = () => `dndnode_${id++}`;

export interface FlowEditorRef {
    getFlow: () => { nodes: Node[]; edges: Edge[] };
}

interface FlowEditorProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
}

const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>(({ initialNodes = [], initialEdges = [] }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  useImperativeHandle(ref, () => ({
      getFlow: () => {
          if (reactFlowInstance) {
              return reactFlowInstance.toObject();
          }
          return { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } };
      }
  }));

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

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
    <div className="flex h-full w-full">
      <ReactFlowProvider>
        <NodeSidebar />
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
});

FlowEditor.displayName = "FlowEditor";

export default FlowEditor;
