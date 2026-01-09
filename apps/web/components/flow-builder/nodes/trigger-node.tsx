import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

export const TriggerNode = memo(({ data }: { data: any }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border min-w-[300px] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2 bg-white">
        <Zap className="w-4 h-4" />
        <span className="font-medium text-sm text-gray-700">When...</span>
      </div>

      {/* Content */}
      <div className="p-4 bg-gray-50/50">
        <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span className="font-medium text-sm">User sends a message</span>
            </div>
            <p className="text-xs text-gray-500 pl-7">
                Message contains {data.keywords?.join(', ') || 'keywords...'}
            </p>
        </div>

        <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-blue-500 font-medium hover:bg-blue-50 hover:border-blue-200 transition-colors">
            + New Trigger
        </button>
      </div>

      {/* Footer Label */}
      <div className="px-4 py-2 flex justify-end">
        <span className="text-xs text-gray-400">Then</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        style={{ right: -6, top: '85%' }}
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
