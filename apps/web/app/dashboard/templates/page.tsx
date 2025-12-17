"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Templates</h2>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border rounded-xl bg-card shadow-sm p-12 text-center">
        <div className="relative w-64 h-64 mb-6">
             {/* Using the generated artifact image. In a real app, this would be served from public/ or an asset CDN. 
                 For this environment, we assume the file is placed in public/images/ or similar. 
                 Since I cannot move files to public easily without a command, I will use a placeholder or assume it's there.
                 Wait, I should copy the artifact to the public folder first if I want it to render.
                 I'll use a placeholder for now and copy it in a subsequent step if needed, or just use the absolute path if allowed (unlikely for web).
                 Actually, for Next.js to serve it, it needs to be in public/. 
                 I will write the file assuming it will be in /images/templates-empty.png and then I will try to move it.
             */}
          <Image
            src="/images/templates-empty.png" 
            alt="No templates"
            fill
            className="object-contain"
          />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">You haven&apos;t created any templates yet</h3>
        <p className="text-muted-foreground max-w-md mb-8">
          With ReXocial Templates you can share and reuse a whole bot or a particular set of elements.
        </p>
        
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Create My First Template
        </Button>
      </div>
    </div>
  );
}
