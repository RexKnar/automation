import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

export interface Flow {
    id: string;
    name: string;
    workspaceId: string;
    isActive: boolean;
    triggerType: string;
    createdAt: string;
    updatedAt: string;
    nodes: any[];
    edges: any[];
}

export const useFlows = (workspaceId?: string) => {
    return useQuery({
        queryKey: ["flows", workspaceId],
        queryFn: async () => {
            if (!workspaceId) return [];
            const { data } = await axios.get<Flow[]>("/automation/flows", {
                params: { workspaceId },
            });
            return data;
        },
        enabled: !!workspaceId,
    });
};

export const useCreateFlow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; workspaceId: string }) => {
            const response = await axios.post("/automation/flows", data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["flows", variables.workspaceId] });
        },
    });
};

export const useDeleteFlow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/automation/flows/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flows"] });
        },
    });
};

export const useFlow = (id: string) => {
    return useQuery({
        queryKey: ["flow", id],
        queryFn: async () => {
            const { data } = await axios.get<Flow>(`/automation/flows/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdateFlow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Flow> }) => {
            const response = await axios.patch(`/automation/flows/${id}`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["flow", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["flows"] });
        },
    });
};

export const useFlowStats = (id: string) => {
    return useQuery({
        queryKey: ["flow-stats", id],
        queryFn: async () => {
            const { data } = await axios.get<any>(`/automation/flows/${id}/stats`);
            return data;
        },
        enabled: !!id,
    });
};
