"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Info, MessageCircle, MoreHorizontal, Send, Heart, Bookmark, Share2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useInstagramMedia } from "@/hooks/use-instagram-media";

export default function AutomationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const flowId = params.flowId as string;
  const channelId = params.channelId as string;

  const [activeTab, setActiveTab] = useState("insights");
  
  // State for configuration (populated from flow data)
  const [triggerType, setTriggerType] = useState("specific");
  const [keywordType, setKeywordType] = useState("specific");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [replyToComments, setReplyToComments] = useState(false);
  const [replies, setReplies] = useState<string[]>(["", "", ""]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  
  // Advanced DM Options State
  const [openingDM, setOpeningDM] = useState(true);
  const [openingDMText, setOpeningDMText] = useState("");
  const [replyButtonText, setReplyButtonText] = useState("");
  const [dmLinkText, setDmLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const { data: mediaItems } = useInstagramMedia();

  // Fetch Flow Data
  const { data: flow, isLoading } = useQuery({
    queryKey: ['flow', flowId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/automation/flows/${flowId}`);
      return res.data;
    }
  });

  // Populate state when flow data is loaded
  useEffect(() => {
    if (flow) {
      // Parse nodes to populate state
      const triggerNode = flow.nodes.find((n: any) => n.type === 'TRIGGER');
      if (triggerNode) {
        setTriggerType(triggerNode.data.triggerType || "specific");
        setKeywordType(triggerNode.data.keywordType || "specific");
        setKeywords(triggerNode.data.keywords || []);
        setKeywordInput(triggerNode.data.keywords?.join(", ") || "");
        setSelectedMediaId(triggerNode.data.postId || null);
      }

      const replyNode = flow.nodes.find((n: any) => n.id === 'comment_reply');
      if (replyNode) {
        setReplyToComments(true);
        setReplies(replyNode.data.replies || ["", "", ""]);
      }

      const openingNode = flow.nodes.find((n: any) => n.id === 'opening_dm');
      if (openingNode) {
        setOpeningDM(true);
        setOpeningDMText(openingNode.data.content || "");
        setReplyButtonText(openingNode.data.buttons?.[0]?.label || "");
      }

      const linkNode = flow.nodes.find((n: any) => n.id === 'link_dm');
      if (linkNode) {
        const content = linkNode.data.content || "";
        const parts = content.split('\nhttps');
        if (parts.length > 1) {
            setDmLinkText(parts[0]);
            setLinkUrl('https' + parts[1]);
        } else {
            setDmLinkText(content);
        }
      }
    }
  }, [flow]);

  const updateFlowMutation = useMutation({
    mutationFn: async (data: any) => {
      return axiosInstance.patch(`/automation/flows/${flowId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow', flowId] });
    }
  });

  const handleStop = () => {
    updateFlowMutation.mutate({ isActive: false });
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Configuration Sidebar (Read-only) */}
      <div className="w-[400px] border-r bg-background flex flex-col overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/${channelId}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-semibold text-lg truncate w-48">{flow?.name || "Automation"}</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/${channelId}/automations/${flowId}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleStop}>Stop</Button>
          </div>
        </div>

        <div className="p-6 space-y-8 pb-24 opacity-80 pointer-events-none">
           {/* Trigger Section */}
           <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base">When someone comments on</h3>
            </div>
            
            <RadioGroup value={triggerType} className="space-y-3">
              <div className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-colors ${triggerType === 'specific' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent'}`}>
                <RadioGroupItem value="specific" id="specific" className="mt-1" />
                <div className="grid gap-1.5 flex-1">
                  <Label htmlFor="specific" className="font-medium">a specific post or reel</Label>
                  {triggerType === 'specific' && selectedMediaId && (
                    <div className="mt-2">
                        {/* Show selected media preview */}
                        <div className="aspect-square w-20 bg-muted rounded-md overflow-hidden border relative">
                             {(() => {
                                const media = mediaItems?.find((m: any) => m.id === selectedMediaId);
                                if (media) {
                                    return (
                                        <img 
                                            src={media.thumbnail_url || media.media_url} 
                                            alt="Post" 
                                            className="object-cover w-full h-full" 
                                        />
                                    );
                                }
                                return <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">Post</div>;
                             })()}
                        </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${triggerType === 'any' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent'}`}>
                <RadioGroupItem value="any" id="any" />
                <div className="flex-1 flex items-center justify-between">
                    <Label htmlFor="any" className="font-medium">any post or reel</Label>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PRO</span>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${triggerType === 'next' ? 'border-blue-600 bg-blue-50/50' : 'border-transparent'}`}>
                <RadioGroupItem value="next" id="next" />
                <div className="flex-1 flex items-center justify-between">
                    <Label htmlFor="next" className="font-medium">next post or reel</Label>
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
            <Input value={keywordInput} readOnly className="text-black" />
          </section>

          {/* Response Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base">They will get</h3>
            </div>
            {/* Opening DM */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
                <Label className="font-medium">an opening DM</Label>
                <textarea 
                    className="w-full min-h-[100px] p-3 rounded-md border text-sm resize-none text-black"
                    value={openingDMText}
                    readOnly
                />
            </div>
             {/* Link DM */}
             <div className="space-y-4 p-4 border rounded-lg bg-card">
                <Label className="font-medium">a DM with a link</Label>
                <textarea 
                    className="w-full min-h-[80px] p-3 rounded-md border text-sm resize-none text-black"
                    value={dmLinkText}
                    readOnly
                />
                {linkUrl && (
                    <Input value={linkUrl} readOnly className="text-black" />
                )}
            </div>
          </section>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-muted/10 flex flex-col">
        <div className="border-b bg-background px-6 py-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b-0">
                    <TabsTrigger value="insights" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-6">Insights</TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-6">Preview</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'insights' ? (
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Best things to do next */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Best things to do next</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-pink-50 to-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="p-3 bg-pink-100 rounded-full text-pink-600">
                                        <Heart className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base mb-1">Boost clicks on your link</h3>
                                        <p className="text-sm text-muted-foreground">A quick follow-up increases clicks by 36% on average</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-yellow-50 to-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                                        <Share2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base mb-1">Get more followers</h3>
                                        <p className="text-sm text-muted-foreground">Ask people to follow you before sharing your content</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Key Metrics */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold">Key metrics</h2>
                            <Info className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <Card>
                            <CardContent className="p-0">
                                {flow?.runCount > 0 ? (
                                    <div className="grid grid-cols-4 divide-x">
                                        <div className="p-6">
                                            <div className="text-sm text-muted-foreground mb-1">Sends</div>
                                            <div className="text-2xl font-bold">{flow.runCount}</div>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-sm text-muted-foreground mb-1">Clicks</div>
                                            <div className="text-2xl font-bold">0</div>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-sm text-muted-foreground mb-1">CTR</div>
                                            <div className="text-2xl font-bold">{flow.ctr}%</div>
                                        </div>
                                        <div className="p-6">
                                            <div className="text-sm text-muted-foreground mb-1">Emails</div>
                                            <div className="text-2xl font-bold">0</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <h3 className="font-semibold mb-2">No data to show... yet!</h3>
                                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                            Ask a friend to comment on your post with the word(s) you picked to test your automation and start collecting data
                                        </p>
                                        <div className="grid grid-cols-4 gap-4 mt-8 opacity-50">
                                            <div className="text-left"><div className="text-xs">Sends</div><div className="text-xl font-bold">0</div></div>
                                            <div className="text-left"><div className="text-xs">Clicks</div><div className="text-xl font-bold">0</div></div>
                                            <div className="text-left"><div className="text-xs">CTR</div><div className="text-xl font-bold">0%</div></div>
                                            <div className="text-left"><div className="text-xs">Emails</div><div className="text-xl font-bold">0</div></div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full py-8">
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
                            <Tabs defaultValue="post" className="flex-1 flex flex-col">
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
                                        <ArrowLeft className="w-6 h-6" />
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
            )}
        </div>
      </div>
    </div>
  );
}
