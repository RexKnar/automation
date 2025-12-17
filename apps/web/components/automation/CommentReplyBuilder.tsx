"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, MessageCircle, MoreHorizontal, Send, Heart, Bookmark, Share2, Plus, Link as LinkIcon, AlertCircle } from "lucide-react";
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
}

export function CommentReplyBuilder({ initialData, onSave, isSaving, channelId, onCancel }: CommentReplyBuilderProps) {
  const [triggerType, setTriggerType] = useState(initialData?.triggerType || "specific");
  const [keywordType, setKeywordType] = useState(initialData?.keywordType || "specific");
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [keywordInput, setKeywordInput] = useState(initialData?.keywords?.join(", ") || "");
  const [replyToComments, setReplyToComments] = useState(initialData?.replyToComments ?? false);
  const [replies, setReplies] = useState<string[]>(initialData?.replies || ["Thanks! Please see DMs.", "Sent you a message! Check it out!", "Nice! Check your DMs!"]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(initialData?.selectedMediaId || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("post");

  // Advanced DM Options State
  const [openingDM, setOpeningDM] = useState(initialData?.openingDM ?? true);
  const [openingDMText, setOpeningDMText] = useState(initialData?.openingDMText || "Hey there! I'm so happy you're here, thanks so much for your interest 😊\n\nClick below and I'll send you the link in just a sec ✨");
  const [replyButtonText, setReplyButtonText] = useState(initialData?.replyButtonText || "Send me the link");
  const [askFollow, setAskFollow] = useState(initialData?.askFollow ?? false);
  const [askEmail, setAskEmail] = useState(initialData?.askEmail ?? false);
  const [dmLinkText, setDmLinkText] = useState(initialData?.dmLinkText || "");
  const [followUpDM, setFollowUpDM] = useState(initialData?.followUpDM ?? false);
  const [showLinkInput, setShowLinkInput] = useState(!!initialData?.linkUrl);
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || "");
  
  const [errors, setErrors] = useState<string[]>([]);

  const { data: mediaItems, isLoading: isMediaLoading } = useInstagramMedia();

  const handleMediaSelect = (id: string) => {
    setSelectedMediaId(id);
    setIsModalOpen(false);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeywordInput(value);
    setKeywords(value.split(",").map(s => s.trim()).filter(s => s.length > 0));
    setActiveTab("comments");
  };

  const handleKeywordTypeChange = (value: string) => {
    setKeywordType(value);
    setActiveTab("comments");
  };

  const handleReplyChange = (index: number, value: string) => {
    const newReplies = [...replies];
    newReplies[index] = value;
    setReplies(newReplies);
  };

  const validate = () => {
    const newErrors = [];
    
    if (triggerType === 'specific' && !selectedMediaId) {
      newErrors.push("Please select a specific post or reel.");
    }

    if (keywordType === 'specific' && keywords.length === 0) {
      newErrors.push("Please enter at least one keyword.");
    }

    if (replyToComments && replies.every(r => !r.trim())) {
      newErrors.push("Please enter at least one reply text.");
    }

    if (openingDM && !openingDMText.trim()) {
      newErrors.push("Opening DM text cannot be empty.");
    }

    if (openingDM && !replyButtonText.trim()) {
      newErrors.push("Reply button text cannot be empty.");
    }

    if ((dmLinkText || linkUrl) && !dmLinkText.trim() && !linkUrl.trim()) {
        // If the section is "active" (implied by having content), ensure it's valid. 
        // But here we treat it as: if you want to send a link DM, you must have content.
        // Actually, let's just say if the user *intends* to have this step.
        // For now, we'll check if both are empty, it's fine (step skipped), but if one is filled, maybe check?
        // Let's enforce: if showLinkInput is true, URL is required.
        if (showLinkInput && !linkUrl.trim()) {
             newErrors.push("Please enter a valid URL.");
        }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const data = {
      triggerType,
      keywordType,
      keywords,
      selectedMediaId,
      replyToComments,
      replies,
      openingDM,
      openingDMText,
      replyButtonText,
      askFollow,
      askEmail,
      dmLinkText,
      followUpDM,
      linkUrl
    };

    await onSave(data);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Configuration Sidebar */}
      <div className="w-[400px] border-r bg-background flex flex-col overflow-y-auto">
        <div className="p-4 border-b flex items-center gap-2 sticky top-0 bg-background z-10">
          <Link href={`/dashboard/${channelId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">{initialData ? "Edit Automation" : "Auto-DM links from comments"}</h1>
        </div>

        <div className="p-6 space-y-8 pb-24">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Trigger Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base">When someone comments on</h3>
            </div>
            
            <RadioGroup value={triggerType} onValueChange={setTriggerType} className="space-y-3">
              <div className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-colors ${triggerType === 'specific' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-muted/50'}`}>
                <RadioGroupItem value="specific" id="specific" className="mt-1" />
                <div className="grid gap-1.5 flex-1">
                  <Label htmlFor="specific" className="font-medium cursor-pointer">a specific post or reel</Label>
                  {triggerType === 'specific' && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {isMediaLoading ? (
                            <div className="col-span-3 py-4 text-center text-xs text-muted-foreground">Loading posts...</div>
                        ) : mediaItems && mediaItems.length > 0 ? (
                            <>
                                {mediaItems.slice(0, 5).map((item: any) => (
                                    <div 
                                        key={item.id} 
                                        className={`aspect-square bg-muted rounded-md relative overflow-hidden border cursor-pointer hover:opacity-80 ${selectedMediaId === item.id ? 'ring-2 ring-blue-600' : ''}`}
                                        onClick={() => setSelectedMediaId(item.id)}
                                    >
                                        <img 
                                            src={item.thumbnail_url || item.media_url} 
                                            alt="Post" 
                                            className="object-cover w-full h-full" 
                                        />
                                        {item.media_type === 'VIDEO' && (
                                            <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                                                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div 
                                    className="aspect-square bg-muted rounded-md flex items-center justify-center border border-dashed cursor-pointer hover:bg-muted/80"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <span className="text-xs text-muted-foreground">Select</span>
                                </div>
                            </>
                        ) : (
                            <div className="col-span-3 py-4 text-center text-xs text-muted-foreground">No posts found</div>
                        )}
                    </div>
                  )}
                  
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="link" className="text-blue-600 h-auto p-0 justify-start">Show All</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Select a Post or Reel</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-1">
                            {isMediaLoading ? (
                                <div className="flex items-center justify-center h-full">Loading...</div>
                            ) : (
                                <div className="grid grid-cols-4 gap-4">
                                    {mediaItems?.map((item: any) => (
                                        <div 
                                            key={item.id} 
                                            className={`aspect-square bg-muted rounded-md relative overflow-hidden border cursor-pointer hover:opacity-80 transition-all ${selectedMediaId === item.id ? 'ring-4 ring-blue-600' : ''}`}
                                            onClick={() => handleMediaSelect(item.id)}
                                        >
                                            <img 
                                                src={item.thumbnail_url || item.media_url} 
                                                alt="Post" 
                                                className="object-cover w-full h-full" 
                                            />
                                            {item.media_type === 'VIDEO' && (
                                                <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-[10px] truncate">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${triggerType === 'any' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-muted/50'}`}>
                <RadioGroupItem value="any" id="any" />
                <div className="flex-1 flex items-center justify-between">
                    <Label htmlFor="any" className="font-medium cursor-pointer">any post or reel</Label>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PRO</span>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${triggerType === 'next' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-muted/50'}`}>
                <RadioGroupItem value="next" id="next" />
                <div className="flex-1 flex items-center justify-between">
                    <Label htmlFor="next" className="font-medium cursor-pointer">next post or reel</Label>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PRO</span>
                </div>
              </div>
            </RadioGroup>
          </section>

          {/* Keyword Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base">And this comment has</h3>
            </div>

            <RadioGroup value={keywordType} onValueChange={handleKeywordTypeChange} className="space-y-3">
                <div className={`space-y-3 p-3 rounded-lg border-2 transition-colors ${keywordType === 'specific' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-muted/50'}`}>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="specific" id="word-specific" />
                        <Label htmlFor="word-specific" className="font-medium cursor-pointer">a specific word or words</Label>
                    </div>
                    {keywordType === 'specific' && (
                        <div className="pl-7 space-y-2">
                            <Input 
                                placeholder="Enter a word or multiple" 
                                value={keywordInput}
                                onChange={handleKeywordChange}
                                onFocus={() => setActiveTab("comments")}
                                className="text-black"
                            />
                            <p className="text-xs text-muted-foreground">Use commas to separate words</p>
                            <div className="flex gap-2 flex-wrap">
                                <span className="bg-white border px-2 py-1 rounded text-xs text-muted-foreground">Price</span>
                                <span className="bg-white border px-2 py-1 rounded text-xs text-muted-foreground">Link</span>
                                <span className="bg-white border px-2 py-1 rounded text-xs text-muted-foreground">Shop</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${keywordType === 'any' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-muted/50'}`}>
                    <RadioGroupItem value="any" id="word-any" />
                    <Label htmlFor="word-any" className="font-medium cursor-pointer">any word</Label>
                </div>
            </RadioGroup>

            <div className="space-y-3">
                <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="reply-comments" className="text-sm font-normal">reply to their comments under the post</Label>
                    <Switch id="reply-comments" checked={replyToComments} onCheckedChange={setReplyToComments} />
                </div>
                
                {replyToComments && (
                    <div className="pl-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {replies.map((reply, index) => (
                            <Input 
                                key={index}
                                value={reply}
                                onChange={(e) => handleReplyChange(index, e.target.value)}
                                placeholder={`Reply option ${index + 1}`}
                                className="text-sm text-black"
                            />
                        ))}
                    </div>
                )}
            </div>
          </section>

          {/* Response Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base">They will get</h3>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between">
                    <Label htmlFor="opening-dm" className="font-medium">an opening DM</Label>
                    <Switch id="opening-dm" checked={openingDM} onCheckedChange={setOpeningDM} />
                </div>
                
                {openingDM && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <textarea 
                            className="w-full min-h-[100px] p-3 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            value={openingDMText}
                            onChange={(e) => setOpeningDMText(e.target.value)}
                        />
                        <Input 
                            value={replyButtonText}
                            onChange={(e) => setReplyButtonText(e.target.value)}
                            placeholder="Button text"
                            className="text-black"
                        />
                        <div className="flex items-center gap-1 text-xs text-blue-500 cursor-pointer hover:underline">
                            <Info className="w-3 h-3" />
                            <span>Why does an Opening DM matter?</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2">
                    <Label htmlFor="ask-follow" className="font-medium">a DM asking to follow you before they get the link</Label>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PRO</span>
                </div>
                <Switch id="ask-follow" checked={askFollow} onCheckedChange={setAskFollow} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2">
                    <Label htmlFor="ask-email" className="font-medium">a DM asking for their email</Label>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PRO</span>
                </div>
                <Switch id="ask-email" checked={askEmail} onCheckedChange={setAskEmail} />
            </div>
          </section>

          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base">And then, they will get</h3>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-card">
                <Label className="font-medium">a DM with a link</Label>
                <textarea 
                    className="w-full min-h-[80px] p-3 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Write a message"
                    value={dmLinkText}
                    onChange={(e) => setDmLinkText(e.target.value)}
                />
                
                {showLinkInput ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input 
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="pl-9 text-black"
                                autoFocus
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShowLinkInput(false)}>Cancel</Button>
                    </div>
                ) : (
                    <Button variant="outline" className="w-full gap-2" onClick={() => setShowLinkInput(true)}>
                        <Plus className="w-4 h-4" />
                        Add A Link
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2">
                  <Label htmlFor="follow-up" className="font-medium">a follow up DM if they don't click the link</Label>
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PRO</span>
              </div>
              <Switch id="follow-up" checked={followUpDM} onCheckedChange={setFollowUpDM} />
            </div>
          </section>
        </div>

        {/* Go Live / Save Button */}
        <div className="p-4 border-t bg-background sticky bottom-0">
            <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-lg"
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

                    <TabsContent value="dm" className="flex-1 m-0 bg-black p-4">
                        <div className="text-center text-zinc-500 mt-20">
                            DM Preview
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
