import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

interface CreateBusinessData {
    businessName: string;
    businessCategory?: string;
    businessAddress?: string;
    phone: string;
    email: string;
    contactPerson: string;
    contactEmail?: string;
    contactPhone?: string;
}

interface UpdateBusinessData {
    businessName?: string;
    businessCategory?: string;
    businessAddress?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    contactEmail?: string;
    contactPhone?: string;
}

interface UpdateOnboardingStepData {
    step: number;
}

export const useCreateBusiness = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateBusinessData) => {
            const response = await axiosInstance.post("/business", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business"] });
        },
    });
};

export const useUpdateBusiness = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateBusinessData) => {
            const response = await axiosInstance.patch("/business", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business"] });
        },
    });
};

export const useGetBusiness = () => {
    return useQuery({
        queryKey: ["business"],
        queryFn: async () => {
            const response = await axiosInstance.get("/business/me");
            return response.data;
        },
        retry: false,
    });
};

export const useUpdateOnboardingStep = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateOnboardingStepData) => {
            const response = await axiosInstance.patch("/business/onboarding-step", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business"] });
        },
    });
};
