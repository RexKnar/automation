"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Zap, MessageSquare, Users, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: "new-followers",
    title: "Say hi to new followers",
    description: "Send new followers a one-time welcome message when they hit follow",
    icon: Users,
    type: "Quick Automation",
    tag: "NEW",
    category: "Grow your followers"
  },
  {
    id: "auto-dm",
    title: "Auto-DM links from comments",
    description: "Send a link when people comment on a post or reel",
    icon: MessageSquare,
    type: "Quick Automation",
    tag: "POPULAR",
    category: "Drive traffic"
  },
  {
    id: "story-leads",
    title: "Generate leads with stories",
    description: "Use limited-time offers in your Stories to convert leads",
    icon: TrendingUp,
    type: "Quick Automation",
    category: "Engage your audience"
  }
];

export function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSelectTemplate = (templateId: string) => {
    // Navigate to the flow builder with the selected template
    // For now, we'll just create a draft and redirect to edit page
    // In a real app, we'd probably create the automation first via API
    onClose();
    router.push(`/dashboard/instagram/automation/new?template=${templateId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-slate-900 border-white/10 text-white h-[80vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-2xl font-bold">Templates</DialogTitle>
            <Button variant="outline" className="text-black border-white/20 hover:bg-white/10 hover:text-white">
              Start From Scratch
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search Instagram templates..." 
              className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">By goal</h3>
              <div className="space-y-1">
                {["Grow your followers", "Engage your audience", "Drive traffic"].map((item) => (
                  <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">By trigger</h3>
              <div className="space-y-1">
                {["Post or Reel comment", "DM", "Story reply", "Live comment"].map((item) => (
                  <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-black/20">
            <h2 className="text-xl font-bold mb-4">Recommended</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className="bg-white text-slate-900 border-none hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {template.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Zap className="h-3 w-3" />
                        {template.type}
                      </div>
                      {template.tag && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                          {template.tag}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@/components/ui/button";
