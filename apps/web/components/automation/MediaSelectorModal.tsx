"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Loader2, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

export function MediaSelectorModal({ isOpen, onClose, onSelect }: MediaSelectorModalProps) {
  const { data: media, isLoading } = useQuery({
    queryKey: ["instagram-media"],
    queryFn: async () => {
      const response = await axiosInstance.get<{ media: MediaItem[] }>("/meta/instagram-media");
      return response.data.media;
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-white/10 text-white h-[80vh] flex flex-col p-0">
        <div className="p-6 border-b border-white/10">
          <DialogTitle className="text-2xl font-bold">Select Post or Reel</DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : !media?.length ? (
            <div className="text-center text-gray-400 py-12">
              No posts found. Make sure your Instagram account is connected and has content.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <Card 
                  key={item.id}
                  className="group relative aspect-square bg-black/20 border-white/10 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Image
                    src={item.thumbnail_url || item.media_url}
                    alt={item.caption || "Instagram post"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">Select</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 p-1 rounded">
                    {item.media_type === "VIDEO" ? (
                      <Video className="h-4 w-4 text-white" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
