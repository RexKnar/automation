import { memo } from 'react';

export const NoteNode = memo(({ data }: { data: any }) => {
  return (
    <div className="bg-[#FFF8E7] rounded-xl p-4 shadow-sm min-w-[200px] max-w-[250px] border border-[#F5E6C8]">
      <p className="text-sm text-gray-800 leading-relaxed font-medium">
        {data.label}
      </p>
    </div>
  );
});

NoteNode.displayName = 'NoteNode';
