"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ResponseConfig {
  message: string;
  buttonText: string;
  link: string;
}

interface ResponseSectionProps {
  config: ResponseConfig;
  onChange: (updates: Partial<ResponseConfig>) => void;
}

export function ResponseSection({ config, onChange }: ResponseSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">They will get</h2>
      
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label>an opening DM</Label>
          <Switch checked={true} />
        </div>

        <div className="space-y-2">
          <Textarea 
            value={config.message}
            onChange={(e) => onChange({ message: e.target.value })}
            className="min-h-[100px]"
            placeholder="Enter your welcome message..."
          />
        </div>

        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input 
            value={config.buttonText}
            onChange={(e) => onChange({ buttonText: e.target.value })}
            placeholder="Send me the link"
          />
        </div>
      </Card>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">And then, they will get</h2>
      
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>a DM with a link</Label>
          <Input 
            value={config.link}
            onChange={(e) => onChange({ link: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </Card>
    </div>
  );
}
