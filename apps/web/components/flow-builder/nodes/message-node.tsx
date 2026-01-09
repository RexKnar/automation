import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Instagram, Link as LinkIcon, Clock } from 'lucide-react';

export const MessageNode = memo(({ data }: { data: any }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border min-w-[300px] max-w-[320px] overflow-hidden">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        style={{ left: -6, top: '20%' }}
      />

      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 flex items-center justify-center text-white">
            <Instagram className="w-5 h-5" />
        </div>
        <div>
            <div className="text-[10px] text-gray-500 font-medium">Instagram</div>
            <div className="font-semibold text-sm text-gray-900">{data.label || 'Send Message'}</div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="bg-gray-100 rounded-lg p-3 mb-2 relative group">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {data.content}
            </p>
            {data.buttons && data.buttons.length > 0 && (
                <div className="mt-3 space-y-2">
                    {data.buttons.map((btn: any, idx: number) => (
                        <div key={idx} className="bg-white rounded border px-3 py-2 text-sm font-medium text-center flex items-center justify-center gap-2 relative">
                            {btn.label}
                            {btn.action === 'link' && (
                                <div className="absolute right-2 flex gap-1">
                                    <LinkIcon className="w-3 h-3 text-blue-500" />
                                    {btn.url && <div className="w-2 h-2 rounded-full bg-orange-400" />}
                                </div>
                            )}
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`btn-${idx}`}
                                className="!w-2 !h-2 !bg-gray-400"
                                style={{ right: -6 }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Delay Indicator if present */}
        {data.delay && (
            <div className="bg-purple-50 rounded-lg p-2 flex items-center justify-center gap-2 text-sm text-purple-700 font-medium mb-2">
                <Clock className="w-4 h-4" />
                Waiting {data.delay}
            </div>
        )}

        <div className="flex justify-end mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
                Next Step 
                <div className="w-2 h-2 rounded-full border border-gray-300" />
            </span>
        </div>
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

MessageNode.displayName = 'MessageNode';
