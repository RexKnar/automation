import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    withCredentials: true, // Important for cookies
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
    accessToken = null;
};

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                setAccessToken(data.access_token);
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                clearAccessToken();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
