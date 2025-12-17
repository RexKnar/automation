"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { MediaSelectorModal } from "./MediaSelectorModal";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface TriggerConfig {
  type: string;
  keywords: string[];
  postId: string | null;
  postType: "ANY" | "SPECIFIC";
  mediaUrl?: string;
}

interface TriggerSectionProps {
  config: TriggerConfig;
  onChange: (updates: Partial<TriggerConfig>) => void;
}

export function TriggerSection({ config, onChange }: TriggerSectionProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">When someone comments on</h2>
      
      <Card className="p-4 space-y-4">
        <RadioGroup 
          value={config.postType} 
          onValueChange={(val) => onChange({ postType: val as "ANY" | "SPECIFIC" })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SPECIFIC" id="specific" />
            <Label htmlFor="specific">a specific post or reel</Label>
          </div>
          
          {config.postType === "SPECIFIC" && (
            <div className="ml-6 mt-2">
              {config.mediaUrl ? (
                <div className="relative w-32 aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <Image 
                    src={config.mediaUrl} 
                    alt="Selected post" 
                    fill 
                    className="object-cover" 
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ postId: null, mediaUrl: undefined });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    onClick={() => setIsMediaModalOpen(true)}
                    className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-all text-gray-500 hover:text-blue-500"
                  >
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">Select Post</span>
                  </div>
                </div>
              )}
              
              {!config.mediaUrl && (
                <div className="mt-2">
                  <button 
                    onClick={() => setIsMediaModalOpen(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Show All
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ANY" id="any" />
            <Label htmlFor="any">any post or reel <Badge variant="secondary" className="ml-2 text-xs">PRO</Badge></Label>
          </div>
        </RadioGroup>
      </Card>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">And this comment has</h2>
      
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>a specific word or words</Label>
          <Input 
            value={config.keywords.join(", ")}
            onChange={(e) => onChange({ keywords: e.target.value.split(",").map(s => s.trim()) })}
            placeholder="e.g. bootcamp, link, price"
          />
          <p className="text-xs text-gray-500">Use commas to separate words</p>
        </div>
      </Card>

      <MediaSelectorModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(media) => {
          onChange({ 
            postId: media.id, 
            mediaUrl: media.thumbnail_url || media.media_url 
          });
        }}
      />
    </div>
  );
}
