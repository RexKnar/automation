"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, MessageCircle, MoreHorizontal, Send, Heart, Bookmark, Share2, Plus, Link as LinkIcon, AlertCircle, Phone, Video, Mic, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { useInstagramMedia } from "@/hooks/use-instagram-media";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommentReplyBuilderProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
  channelId: string;
  onCancel?: () => void;
  isActive?: boolean;
  onDelete?: () => Promise<void>;
  onToggleStatus?: () => Promise<void>;
}

export function CommentReplyBuilder({ initialData, onSave, isSaving, channelId, onCancel, isActive, onDelete, onToggleStatus }: CommentReplyBuilderProps) {
  // ... existing state ...

  // ... existing code ...

        {/* Go Live / Save Button */}
        <div className="p-4 border-t bg-background sticky bottom-0 flex gap-3">
            {initialData && onDelete && (
                <Button 
                    variant="destructive"
                    className="flex-1 h-12"
                    onClick={onDelete}
                    disabled={isSaving}
                >
                    Delete
                </Button>
            )}
            
            {initialData && onToggleStatus && (
                <Button 
                    variant="outline"
                    className={`flex-1 h-12 ${isActive ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                    onClick={onToggleStatus}
                    disabled={isSaving}
                >
                    {isActive ? "Stop" : "Publish"}
                </Button>
            )}

            <Button 
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-lg"
                onClick={handleSave}
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : (initialData ? "Save Changes" : "Go live")}
            </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-muted/30 flex items-center justify-center p-8">
        <div className="w-[380px] h-[750px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative flex flex-col">
            {/* Status Bar */}
            <div className="h-12 bg-black text-white flex items-center justify-between px-6 text-xs font-medium z-20">
                <span>9:41</span>
                <div className="flex gap-1.5">
                    <div className="w-4 h-2.5 bg-white rounded-[1px]"></div>
                    <div className="w-4 h-2.5 bg-white rounded-[1px]"></div>
                    <div className="w-4 h-2.5 bg-white rounded-[1px]"></div>
                </div>
            </div>

            {/* App Content */}
            <div className="flex-1 bg-black text-white overflow-hidden flex flex-col relative">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center">
                        <TabsList className="bg-zinc-800/80 backdrop-blur-md text-white border-none rounded-full h-10 px-1">
                            <TabsTrigger value="post" className="rounded-full px-4 text-xs data-[state=active]:bg-zinc-600">Post</TabsTrigger>
                            <TabsTrigger value="comments" className="rounded-full px-4 text-xs data-[state=active]:bg-zinc-600">Comments</TabsTrigger>
                            <TabsTrigger value="dm" className="rounded-full px-4 text-xs data-[state=active]:bg-zinc-600">DM</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="post" className="flex-1 m-0 overflow-y-auto no-scrollbar">
                        {/* Instagram Header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
                            <div className="flex items-center gap-2">
                                <ArrowLeft className="w-6 h-6" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-zinc-400 uppercase tracking-wide">Rexcoders</span>
                                    <span className="font-bold text-sm">Posts</span>
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="pb-20">
                            {selectedMediaId && mediaItems ? (
                                (() => {
                                    const selectedMedia = mediaItems.find((m: any) => m.id === selectedMediaId);
                                    if (!selectedMedia) return null;
                                    
                                    return (
                                        <>
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                                        <div className="w-full h-full rounded-full bg-black border-2 border-black"></div>
                                                    </div>
                                                    <span className="font-semibold text-sm">rexcoders</span>
                                                </div>
                                                <MoreHorizontal className="w-5 h-5" />
                                            </div>

                                            <div className="aspect-[4/5] bg-zinc-800 relative">
                                                <img 
                                                    src={selectedMedia.thumbnail_url || selectedMedia.media_url} 
                                                    alt="Post Content" 
                                                    className="object-cover w-full h-full" 
                                                />
                                                {selectedMedia.media_type === 'VIDEO' && (
                                                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                                                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-3 py-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-4">
                                                        <Heart className="w-6 h-6" />
                                                        <MessageCircle className="w-6 h-6" />
                                                        <Send className="w-6 h-6" />
                                                    </div>
                                                    <Bookmark className="w-6 h-6" />
                                                </div>
                                                <div className="font-semibold text-sm mb-1">27 likes</div>
                                                <div className="text-sm">
                                                    <span className="font-semibold mr-2">rexcoders</span>
                                                    {selectedMedia.caption || "No caption"}
                                                </div>
                                                <div className="text-zinc-500 text-xs mt-1">View all comments</div>
                                                <div className="text-zinc-500 text-[10px] mt-1 uppercase">
                                                    {new Date(selectedMedia.timestamp).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500 p-8 text-center">
                                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                        <Image src="/images/placeholder-post.jpg" alt="Select" width={32} height={32} className="opacity-50" />
                                    </div>
                                    <p>Select a post from the left to preview it here</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="comments" className="flex-1 m-0 bg-black flex flex-col">
                        {/* Comments Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                            <ArrowLeft className="w-6 h-6" onClick={() => setActiveTab("post")} />
                            <span className="font-bold text-sm">Comments</span>
                            <Send className="w-6 h-6" />
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* User Comment */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0"></div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-sm">username</span>
                                        <span className="text-xs text-zinc-500">2m</span>
                                    </div>
                                    <p className="text-sm">
                                        {keywordType === 'specific' && keywords.length > 0 
                                            ? keywords[0] 
                                            : "This is amazing! 🔥"}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-semibold mt-2">
                                        <span>Reply</span>
                                    </div>

                                    {/* Automated Reply */}
                                    {replyToComments && (
                                        <div className="flex gap-3 mt-4">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px] flex-shrink-0">
                                                <div className="w-full h-full rounded-full bg-black"></div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold text-sm">rexcoders</span>
                                                    <span className="text-xs text-zinc-500">Just now</span>
                                                </div>
                                                <p className="text-sm">{replies[0] || "Thanks! Please see DMs."}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Heart className="w-4 h-4 text-zinc-500 mt-1" />
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="p-4 border-t border-zinc-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-black"></div>
                            </div>
                            <div className="flex-1 bg-zinc-900 rounded-full h-10 px-4 flex items-center text-sm text-zinc-500">
                                Add a comment...
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="dm" className="flex-1 m-0 bg-black flex flex-col">
                        {/* DM Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                                <ArrowLeft className="w-6 h-6" onClick={() => setActiveTab("comments")} />
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px]">
                                        <div className="w-full h-full rounded-full bg-black"></div>
                                    </div>
                                    <span className="font-bold text-sm">rexcoders</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="w-6 h-6" />
                                <Video className="w-6 h-6" />
                            </div>
                        </div>

                        {/* DM Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="text-center text-xs text-zinc-500 my-4">
                                {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </div>

                            {/* Opening DM */}
                            {openingDM && (
                                <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex items-end gap-2 max-w-[85%]">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px] flex-shrink-0 mb-1">
                                            <div className="w-full h-full rounded-full bg-black"></div>
                                        </div>
                                        <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-2 text-sm">
                                            {openingDMText || "Hey there! Thanks for your interest!"}
                                        </div>
                                    </div>
                                    
                                    {/* Reply Button (Quick Reply Simulation) */}
                                    {replyButtonText && (
                                        <div className="ml-9 mt-1">
                                            <div className="bg-transparent border border-zinc-700 text-blue-500 rounded-full px-4 py-1.5 text-sm font-semibold cursor-pointer hover:bg-zinc-900 transition-colors">
                                                {replyButtonText}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Follow Reminder */}
                            {askFollow && (
                                <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
                                    <div className="flex items-end gap-2 max-w-[85%]">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px] flex-shrink-0 mb-1">
                                            <div className="w-full h-full rounded-full bg-black"></div>
                                        </div>
                                        <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-2 text-sm">
                                            Please follow our page to continue.
                                        </div>
                                    </div>
                                    <div className="ml-9 mt-1">
                                        <div className="bg-transparent border border-zinc-700 text-blue-500 rounded-full px-4 py-1.5 text-sm font-semibold cursor-pointer hover:bg-zinc-900 transition-colors">
                                            Done
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Email Collection */}
                            {askEmail && (
                                <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-left-2 duration-300 delay-200">
                                    <div className="flex items-end gap-2 max-w-[85%]">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px] flex-shrink-0 mb-1">
                                            <div className="w-full h-full rounded-full bg-black"></div>
                                        </div>
                                        <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-2 text-sm">
                                            Please provide your email address to continue.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DM with Link */}
                            {(dmLinkText || linkUrl) && (
                                <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-left-2 duration-300 delay-300">
                                    <div className="flex items-end gap-2 max-w-[85%]">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px] flex-shrink-0 mb-1">
                                            <div className="w-full h-full rounded-full bg-black"></div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {dmLinkText && (
                                                <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-2 text-sm">
                                                    {dmLinkText}
                                                </div>
                                            )}
                                            
                                            {linkUrl && (
                                                <div className="bg-zinc-800 rounded-xl overflow-hidden max-w-[240px] border border-zinc-700">
                                                    <div className="h-32 bg-zinc-700 flex items-center justify-center relative">
                                                        {/* Placeholder for Link Preview Image */}
                                                        <LinkIcon className="w-8 h-8 text-zinc-500" />
                                                    </div>
                                                    <div className="p-3 bg-zinc-800">
                                                        <div className="text-xs text-zinc-400 truncate">{new URL(linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`).hostname}</div>
                                                        <div className="font-semibold text-sm truncate">Link Preview</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Follow Up DM */}
                            {followUpDM && (
                                <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-left-2 duration-300 delay-500 opacity-50">
                                    <div className="flex items-end gap-2 max-w-[85%]">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px] flex-shrink-0 mb-1">
                                            <div className="w-full h-full rounded-full bg-black"></div>
                                        </div>
                                        <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-2 text-sm">
                                            (Follow up message sent after delay)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-3 border-t border-zinc-800 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Plus className="w-3 h-3 text-black" />
                                </div>
                            </div>
                            <div className="flex-1 bg-zinc-900 rounded-full h-10 px-4 flex items-center text-sm text-zinc-500 justify-between">
                                <span>Message...</span>
                                <div className="flex gap-2">
                                    <Mic className="w-5 h-5 opacity-50" />
                                    <ImageIcon className="w-5 h-5 opacity-50" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            
            {/* Home Indicator */}
            <div className="h-5 bg-black flex justify-center items-start pt-1 z-20">
                <div className="w-32 h-1 bg-white rounded-full"></div>
            </div>
        </div>
      </div>
    </div>
  );
}
