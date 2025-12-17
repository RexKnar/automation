"use client";

import { Smartphone } from "lucide-react";
import Image from "next/image";

interface PreviewSectionProps {
  config: {
    trigger: {
      keywords: string[];
      mediaUrl?: string;
    };
    response: {
      message: string;
      buttonText: string;
      link: string;
    };
  };
}

export function PreviewSection({ config }: PreviewSectionProps) {
  return (
    <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10" />
      
      {/* Screen Content */}
      <div className="w-full h-full bg-black text-white flex flex-col pt-12">
        {/* Header */}
        <div className="px-4 pb-4 border-b border-white/10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600" />
          <span className="font-semibold text-sm">rexcoders</span>
        </div>

        {/* Post Preview (if selected) */}
        {config.trigger.mediaUrl && (
          <div className="relative w-full aspect-square bg-gray-900 mb-4">
            <Image 
              src={config.trigger.mediaUrl} 
              alt="Post preview" 
              fill 
              className="object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-xs text-white/80 truncate">
                Comment "{config.trigger.keywords[0] || 'keyword'}" to get the link
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Incoming Message (Trigger) */}
          <div className="flex justify-end">
            <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] text-sm">
              {config.trigger.keywords[0] || "bootcamp"}
            </div>
          </div>

          {/* Bot Response */}
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap">
              {config.response.message}
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl w-[80%] overflow-hidden">
              <div className="p-3 text-center border-b border-white/10 text-sm font-semibold text-blue-400">
                {config.response.buttonText}
              </div>
            </div>
          </div>

          {/* Link Response */}
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] text-sm text-blue-400 underline">
              {config.response.link}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="h-10 bg-gray-800 rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}
