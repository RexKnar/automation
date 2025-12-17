// Hook for WhatsApp Business authentication and details
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useWhatsAppAuth = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { code: string }) => {
            const response = await axiosInstance.post("/whatsapp/auth", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business"] });
        },
    });
};

export const useSaveWhatsAppDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { wabaId: string; phoneNumberId: string; phoneNumber: string }) => {
            const response = await axiosInstance.post("/whatsapp/details", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business"] });
        },
    });
};
