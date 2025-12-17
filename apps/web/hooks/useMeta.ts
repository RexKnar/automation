import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useMetaAuth = () => {
    return useQuery({
        queryKey: ["meta-auth"],
        queryFn: async () => {
            const response = await axiosInstance.get("/meta/auth");
            return response.data;
        },
        enabled: false, // Only fetch when explicitly called
    });
};

export const useMetaBusinessAccounts = () => {
    return useQuery({
        queryKey: ["meta-business-accounts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/meta/business-accounts");
            return response.data;
        },
    });
};

export const useMetaWhatsAppAccounts = () => {
    return useQuery({
        queryKey: ["meta-whatsapp-accounts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/meta/whatsapp-accounts");
            return response.data;
        },
    });
};

export const useMetaInstagramAccounts = () => {
    return useQuery({
        queryKey: ["meta-instagram-accounts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/meta/instagram-accounts");
            return response.data;
        },
    });
};

export const useDisconnectMeta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete("/meta/disconnect");
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business"] });
            queryClient.invalidateQueries({ queryKey: ["meta-business-accounts"] });
            queryClient.invalidateQueries({ queryKey: ["meta-whatsapp-accounts"] });
            queryClient.invalidateQueries({ queryKey: ["meta-instagram-accounts"] });
        },
    });
};

export const useManualMetaConnection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accessToken: string) => {
            const response = await axiosInstance.post("/meta/connect/manual", { accessToken });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business"] });
            queryClient.invalidateQueries({ queryKey: ["meta-business-accounts"] });
            queryClient.invalidateQueries({ queryKey: ["meta-whatsapp-accounts"] });
            queryClient.invalidateQueries({ queryKey: ["meta-instagram-accounts"] });
        },
    });
};
