import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    role: string;
    channels?: any[];
}

export const useWorkspaces = () => {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => {
            const { data } = await axios.get<Workspace[]>("/workspaces");
            return data;
        },
    });
};
