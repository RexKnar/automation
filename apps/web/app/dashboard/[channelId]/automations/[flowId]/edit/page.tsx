"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { CommentReplyBuilder } from "@/components/automation/CommentReplyBuilder";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function EditAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: workspaces } = useWorkspaces();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Flow Data
  const { data: flow, isLoading } = useQuery({
    queryKey: ['flow', params.flowId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/automation/flows/${params.flowId}`);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Transform Flow Data to Builder Format
  const nodes = flow?.nodes || [];
  const triggerNode = nodes.find((n: any) => n.type === 'TRIGGER');
  const commentReplyNode = nodes.find((n: any) => n.id === 'comment_reply');
  const openingDmNode = nodes.find((n: any) => n.id === 'opening_dm');
  const linkDmNode = nodes.find((n: any) => n.id === 'link_dm');

  const initialData = {
    triggerType: triggerNode?.data?.triggerType || 'specific',
    keywordType: triggerNode?.data?.keywordType || 'specific',
    keywords: triggerNode?.data?.keywords || [],
    selectedMediaId: triggerNode?.data?.postId || null,
    
    replyToComments: !!commentReplyNode,
    replies: commentReplyNode?.data?.replies || [],
    
    openingDM: !!openingDmNode,
    openingDMText: openingDmNode?.data?.content || "",
    replyButtonText: openingDmNode?.data?.buttons?.[0]?.label || "",
    
    // Pro features not yet persisted in nodes, defaulting to false/empty or extracting if we added them to node data
    askFollow: false, 
    askEmail: false,
    followUpDM: false,

    dmLinkText: linkDmNode?.data?.content?.split('\n')[0] || "",
    linkUrl: linkDmNode?.data?.content?.split('\n')[1] || "",
  };

  const handleSave = async (data: any) => {
    try {
      setIsSaving(true);
      
      // Construct Nodes (Same logic as creation)
      const nodes = [
        {
          id: 'trigger',
          type: 'TRIGGER',
          position: { x: 0, y: 0 },
          data: { 
            label: 'Trigger',
            triggerType: data.triggerType,
            keywordType: data.keywordType,
            keywords: data.keywordType === 'specific' ? data.keywords : [],
            postId: data.triggerType === 'specific' ? data.selectedMediaId : null
          }
        }
      ];

      if (data.replyToComments) {
        nodes.push({
          id: 'comment_reply',
          type: 'ACTION',
          position: { x: 0, y: 100 },
          data: {
            label: 'Reply to Comment',
            replies: data.replies
          }
        });
      }

      if (data.openingDM) {
        nodes.push({
          id: 'opening_dm',
          type: 'MESSAGE',
          position: { x: 0, y: 200 },
          data: {
            label: 'Opening DM',
            content: data.openingDMText,
            buttons: [{ label: data.replyButtonText, action: 'next_step' }]
          }
        });
      }

      if (data.dmLinkText || data.linkUrl) {
        nodes.push({
          id: 'link_dm',
          type: 'MESSAGE',
          position: { x: 0, y: 300 },
          data: {
            label: 'Link DM',
            content: `${data.dmLinkText}\n${data.linkUrl}`
          }
        });
      }

      const edges = [];
      let previousNodeId = 'trigger';

      if (data.replyToComments) {
        edges.push({ id: `e-${previousNodeId}-comment_reply`, source: previousNodeId, target: 'comment_reply' });
      }

      if (data.openingDM) {
        edges.push({ id: `e-${previousNodeId}-opening_dm`, source: previousNodeId, target: 'opening_dm' });
        previousNodeId = 'opening_dm';
      }

      if (data.dmLinkText || data.linkUrl) {
        edges.push({ id: `e-${previousNodeId}-link_dm`, source: previousNodeId, target: 'link_dm' });
      }

      const payload = {
        nodes,
        edges,
      };

      await axiosInstance.patch(`/automation/flows/${params.flowId}`, payload);
      
      router.push(`/dashboard/${params.channelId}/automations/${params.flowId}`);
    } catch (error) {
      console.error("Failed to update automation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CommentReplyBuilder 
      initialData={initialData}
      onSave={handleSave} 
      isSaving={isSaving} 
      channelId={params.channelId as string} 
    />
  );
}
