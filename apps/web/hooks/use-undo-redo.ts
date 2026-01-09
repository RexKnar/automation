import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

interface FlowState {
    nodes: Node[];
    edges: Edge[];
}

export const useUndoRedo = (initialNodes: Node[], initialEdges: Edge[]) => {
    const [past, setPast] = useState<FlowState[]>([]);
    const [future, setFuture] = useState<FlowState[]>([]);

    const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
        setPast((past) => [...past, { nodes, edges }]);
        setFuture([]);
    }, []);

    const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
        if (past.length === 0) return null;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setPast(newPast);
        setFuture((future) => [{ nodes: currentNodes, edges: currentEdges }, ...future]);

        return previous;
    }, [past]);

    const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
        if (future.length === 0) return null;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((past) => [...past, { nodes: currentNodes, edges: currentEdges }]);
        setFuture(newFuture);

        return next;
    }, [future]);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    return {
        takeSnapshot,
        undo,
        redo,
        canUndo,
        canRedo,
    };
};
