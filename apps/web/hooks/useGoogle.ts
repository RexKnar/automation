"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface GoogleBusinessAccount {
    name: string;
    accountName: string;
    type: string;
}

interface GoogleBusinessAccountsResponse {
    businesses: GoogleBusinessAccount[];
    connected: boolean;
}

export function useGoogleBusinessAccounts() {
    return useQuery<GoogleBusinessAccountsResponse>({
        queryKey: ["google", "business-accounts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/google/business-accounts");
            return response.data;
        },
    });
}

export function useDisconnectGoogle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.delete("/google/disconnect");
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["google", "business-accounts"] });
        },
    });
}

export function useConnectGoogle() {
    return useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.get("/google/auth");
            return response.data;
        },
        onSuccess: (data) => {
            // Redirect to Google OAuth
            if (data.authUrl) {
                window.location.href = data.authUrl;
            }
        },
    });
}
