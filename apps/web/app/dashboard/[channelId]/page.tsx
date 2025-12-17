"use client";

import { useWorkspaces } from "@/hooks/use-workspaces";
import { useParams } from "next/navigation";
import { Loader2, MessageCircle, Zap, Users, BarChart3, Settings, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ChannelDashboardPage() {
  const params = useParams();
  const { data: workspaces, isLoading } = useWorkspaces();
  
  // Find the current channel from the workspaces data
  // In a real app, we might want a specific hook for fetching a single channel
  const currentWorkspace = workspaces?.[0];
  const channel = currentWorkspace?.channels?.find((c: any) => c.id === params.channelId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!channel) {
    return <div className="p-8">Channel not found</div>;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hello, {channel.name}!</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>1 connected channel</span>
          <span>•</span>
          <span>38 contacts</span>
          <span>•</span>
          <Link href="#" className="text-blue-600 hover:underline">See Insights</Link>
        </div>
      </div>

      {/* Start Here Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Start Here</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Say hi to new followers</CardTitle>
              <CardDescription>Send new followers a one-time welcome message when they hit follow</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 mr-1" /> Quick Automation
                 </div>
                 <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-bold">NEW</span>
               </div>
            </CardContent>
          </Card>

          <Link href={`/dashboard/${params.channelId}/automations/comment-reply`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500 h-full">
                <CardHeader className="pb-2">
                <CardTitle className="text-base">Auto-DM links from comments</CardTitle>
                <CardDescription>Send a link when people comment on a post or reel</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Zap className="w-3 h-3 mr-1" /> Quick Automation
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded font-bold">POPULAR</span>
                </div>
                </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Generate leads with stories</CardTitle>
              <CardDescription>Use limited-time offers in your Stories to convert leads</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 mr-1" /> Quick Automation
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Growth Goals Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Hit Your Growth Goals</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Respond to all your DMs</CardTitle>
              <CardDescription>Auto-send customized replies when people DM you</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 mr-1" /> Quick Automation
                 </div>
               </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Send affiliate product links</CardTitle>
              <CardDescription>Include product card with photos and links of your affiliate collabs</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 mr-1" /> Quick Automation
                 </div>
               </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Automate conversations with AI</CardTitle>
              <CardDescription>Get AI to collect your follower's info, share details or tell it how to reply</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between mt-4">
                 <div className="flex items-center text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3 mr-1" /> Flow Builder
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
