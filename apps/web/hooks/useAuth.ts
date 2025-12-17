import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axiosInstance, { setAccessToken, clearAccessToken } from "@/lib/axios";

interface LoginData {
    email: string;
    password: string;
}

interface SignupData {
    email: string;
    password: string;
    name: string;
}

interface AuthResponse {
    access_token: string;
}

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: LoginData) => {
            const response = await axiosInstance.post<AuthResponse>("/auth/login", data);
            return response.data;
        },
        onSuccess: (data) => {
            setAccessToken(data.access_token);
            router.push("/dashboard");
        },
    });
};

export const useSignup = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: SignupData) => {
            const response = await axiosInstance.post<AuthResponse>("/auth/signup", data);
            return response.data;
        },
        onSuccess: (data) => {
            setAccessToken(data.access_token);
            router.push("/dashboard");
        },
    });
};

export const useLogout = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await axiosInstance.post("/auth/logout");
        },
        onSuccess: () => {
            clearAccessToken();
            router.push("/login");
        },
    });
};
