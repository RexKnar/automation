import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export interface InstagramMedia {
    id: string;
    caption?: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    thumbnail_url?: string;
    permalink: string;
    timestamp: string;
}

export const useInstagramMedia = () => {
    return useQuery({
        queryKey: ["instagram-media"],
        queryFn: async () => {
            const { data } = await axios.get<{ media: InstagramMedia[] }>("/meta/instagram-media");
            return data.media;
        },
    });
};
