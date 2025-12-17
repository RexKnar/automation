"use client";

import { MessageSquare, Clock, GitBranch, Zap } from "lucide-react";

export function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-4">
      <div className="text-sm font-semibold text-muted-foreground mb-2">
        Nodes
      </div>
      
      <div 
        className="flex items-center gap-3 p-3 border rounded-lg cursor-grab hover:bg-accent transition bg-card"
        onDragStart={(event) => onDragStart(event, 'MESSAGE')}
        draggable
      >
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-medium">Message</span>
      </div>

      <div 
        className="flex items-center gap-3 p-3 border rounded-lg cursor-grab hover:bg-accent transition bg-card"
        onDragStart={(event) => onDragStart(event, 'CONDITION')}
        draggable
      >
        <GitBranch className="w-5 h-5 text-orange-500" />
        <span className="text-sm font-medium">Condition</span>
      </div>

      <div 
        className="flex items-center gap-3 p-3 border rounded-lg cursor-grab hover:bg-accent transition bg-card"
        onDragStart={(event) => onDragStart(event, 'DELAY')}
        draggable
      >
        <Clock className="w-5 h-5 text-purple-500" />
        <span className="text-sm font-medium">Delay</span>
      </div>

      <div 
        className="flex items-center gap-3 p-3 border rounded-lg cursor-grab hover:bg-accent transition bg-card"
        onDragStart={(event) => onDragStart(event, 'TRIGGER')}
        draggable
      >
        <Zap className="w-5 h-5 text-yellow-500" />
        <span className="text-sm font-medium">Trigger</span>
      </div>
    </aside>
  );
}
