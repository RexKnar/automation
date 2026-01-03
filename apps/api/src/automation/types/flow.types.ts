export type NodeType =
    | 'TRIGGER'
    | 'MESSAGE'
    | 'CONDITION'
    | 'DELAY'
    | 'INPUT'
    | 'ACTION';

export interface FlowNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: NodeData;
}

export interface NodeData {
    label: string;
    [key: string]: any;
}

export interface MessageNodeData extends NodeData {
    content: string;
    mediaUrl?: string;
    buttons?: Array<{ label: string; action: string }>;
}

export interface ConditionNodeData extends NodeData {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt';
    value: string;
}

export interface DelayNodeData extends NodeData {
    duration: number; // in seconds
    unit: 'seconds' | 'minutes' | 'hours';
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type?: string;
}

export interface FlowGraph {
    nodes: FlowNode[];
    edges: FlowEdge[];
}

export interface ExecutionContext {
    workspaceId: string;
    contactId: string;
    externalId?: string; // Platform specific ID (PSID, WAID)
    flowId: string;
    variables: Record<string, any>;
}
