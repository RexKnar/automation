import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/users/me');
            return data;
        },
    });
};
