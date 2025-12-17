"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Play, Pause, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface Automation {
  id: string;
  name: string;
  type: string;
  status: "DRAFT" | "LIVE" | "PAUSED";
  runCount: number;
  ctr: number;
  updatedAt: string;
}

export function AutomationList() {
  const { data: automations, isLoading } = useQuery({
    queryKey: ["automations"],
    queryFn: async () => {
      const response = await axiosInstance.get<Automation[]>("/automation");
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!automations?.length) {
    return (
      <Card className="bg-black/30 border-white/10 p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">No automations yet</h3>
        <p className="text-gray-400 mb-6">Create your first automation to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {automations.map((automation) => (
        <Card key={automation.id} className="bg-black/30 border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${
                automation.status === 'LIVE' ? 'bg-green-500/10 text-green-500' : 
                automation.status === 'PAUSED' ? 'bg-yellow-500/10 text-yellow-500' : 
                'bg-gray-500/10 text-gray-500'
              }`}>
                {automation.status === 'LIVE' ? <Play className="h-5 w-5" /> : 
                 automation.status === 'PAUSED' ? <Pause className="h-5 w-5" /> : 
                 <Edit className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{automation.type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>Last updated {new Date(automation.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-lg font-semibold text-white">{automation.runCount}</div>
                <div className="text-xs text-gray-400">Runs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white">{automation.ctr}%</div>
                <div className="text-xs text-gray-400">CTR</div>
              </div>
              
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
