"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { CommentReplyBuilder } from "@/components/automation/CommentReplyBuilder";

export default function CommentReplyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: workspaces } = useWorkspaces();
  const [isSaving, setIsSaving] = useState(false);

  const handleGoLive = async (data: any) => {
    try {
      setIsSaving(true);
      
      // Find the correct workspace ID
      const currentWorkspace = workspaces?.find(w => w.channels?.some((c: any) => c.id === params.channelId));
      
      if (!currentWorkspace) {
        console.error("Workspace not found for this channel");
        setIsSaving(false);
        return;
      }

      // Construct Nodes
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

      // Add Reply to Comment Node if enabled
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

      // Add DM Nodes
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

      // Construct Edges (Simplified linear flow for now)
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
        name: "Comment Reply Automation",
        workspaceId: currentWorkspace.id,
        nodes,
        edges,
        isActive: true
      };

      const response = await axiosInstance.post('/automation/flows', payload);
      
      if (response.data && response.data.id) {
        router.push(`/dashboard/${params.channelId}/automations/${response.data.id}`);
      }
    } catch (error) {
      console.error("Failed to save automation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CommentReplyBuilder 
      onSave={handleGoLive} 
      isSaving={isSaving} 
      channelId={params.channelId as string} 
    />
  );
}
