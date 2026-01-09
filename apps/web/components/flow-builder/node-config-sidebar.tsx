import { useState } from 'react';
import { Node } from 'reactflow';
import { X, Trash2, Zap, Instagram, MessageCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TriggerSelectionModal } from './trigger-selection-modal';
import { CommentTriggerWizard } from './comment-trigger-wizard';

interface NodeConfigSidebarProps {
    node: Node | null;
    onClose: () => void;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
}

export function NodeConfigSidebar({ node, onClose, onUpdate, onDelete }: NodeConfigSidebarProps) {
    const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
    const [isEditingTrigger, setIsEditingTrigger] = useState(false);

    if (!node) return null;

    const handleChange = (key: string, value: any) => {
        onUpdate(node.id, { ...node.data, [key]: value });
    };

    const handleTriggerSelect = (triggerType: string) => {
        onUpdate(node.id, { ...node.data, triggerType });
        setIsTriggerModalOpen(false);
        if (triggerType === 'COMMENT') {
            setIsEditingTrigger(true);
        }
    };

    const getTriggerIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE': return MessageCircle;
            default: return Instagram;
        }
    };

    const TriggerIcon = node.data.triggerType ? getTriggerIcon(node.data.triggerType) : Zap;

    if (isEditingTrigger && node.type === 'TRIGGER' && node.data.triggerType === 'COMMENT') {
        return (
            <div className="absolute left-0 top-0 h-full w-[400px] bg-white border-r shadow-xl z-50 flex flex-col animate-in slide-in-from-left duration-200 font-sans">
                <CommentTriggerWizard 
                    data={node.data}
                    onUpdate={(newData) => onUpdate(node.id, { ...node.data, ...newData })}
                    onBack={() => setIsEditingTrigger(false)}
                />
            </div>
        );
    }

    return (
        <>
            <div className="absolute left-0 top-0 h-full w-[400px] bg-white border-r shadow-xl z-50 flex flex-col animate-in slide-in-from-left duration-200 font-sans">
                {/* Header */}
                <div className={`p-4 border-b flex items-center justify-center relative ${node.type === 'TRIGGER' ? 'bg-[#E3FCEF]' : 'bg-gray-50'}`}>
                    <h3 className="font-bold text-lg text-gray-800">
                        {node.type === 'TRIGGER' && 'When...'}
                        {node.type === 'MESSAGE' && 'Send Message'}
                        {node.type === 'NOTE' && 'Note'}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-black/5">
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Trigger Specific UI */}
                    {node.type === 'TRIGGER' && (
                        <>
                            <div className="space-y-4">
                                {node.data.triggerType ? (
                                    <div 
                                        className="border rounded-xl p-4 bg-white shadow-sm relative group hover:border-gray-300 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (node.data.triggerType === 'COMMENT') {
                                                setIsEditingTrigger(true);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                                                <TriggerIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-blue-600">
                                                        {node.data.triggerType === 'COMMENT' && 'Post or Reel Comments'}
                                                        {node.data.triggerType === 'STORY_REPLY' && 'Story Reply'}
                                                        {node.data.triggerType === 'MESSAGE' && 'Instagram Message'}
                                                        {node.data.triggerType === 'ADS' && 'Instagram Ads'}
                                                        {node.data.triggerType === 'LIVE_COMMENTS' && 'Live Comments'}
                                                        {node.data.triggerType === 'REF_URL' && 'Instagram Ref URL'}
                                                        {node.data.triggerType === 'KEYWORD' && 'Keyword Message'}
                                                        {!['COMMENT', 'STORY_REPLY', 'MESSAGE', 'ADS', 'LIVE_COMMENTS', 'REF_URL', 'KEYWORD'].includes(node.data.triggerType) && node.data.triggerType}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {node.data.triggerType === 'COMMENT' && 'User comments on your Post or Reel'}
                                                    {node.data.triggerType === 'STORY_REPLY' && 'User replies to your Story'}
                                                    {node.data.triggerType === 'MESSAGE' && 'User sends a message'}
                                                    {node.data.triggerType === 'ADS' && 'User clicks an Instagram Ad'}
                                                    {node.data.triggerType === 'LIVE_COMMENTS' && 'User comments on your Live'}
                                                    {node.data.triggerType === 'REF_URL' && 'User clicks a referral link'}
                                                    {node.data.triggerType === 'KEYWORD' && 'Message contains keywords'}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                    <span>0 runs</span>
                                                    <span>•</span>
                                                    <span>0% CTR</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                                        No trigger selected
                                    </div>
                                )}

                                <Button 
                                    variant="outline" 
                                    className="w-full border-dashed border-2 border-blue-200 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 h-12 rounded-xl font-medium"
                                    onClick={() => setIsTriggerModalOpen(true)}
                                >
                                    {node.data.triggerType ? 'Change Trigger' : '+ New Trigger'}
                                </Button>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="font-semibold text-gray-900 mb-4">Then...</h4>
                                <Button 
                                    variant="outline" 
                                    className="w-full border-dashed border-2 border-blue-200 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 h-12 rounded-xl font-medium"
                                >
                                    Choose Next Step
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Message Specific */}
                    {node.type === 'MESSAGE' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-medium">Message Content</Label>
                                <Textarea 
                                    value={node.data.content || ''}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    placeholder="Enter your message..."
                                    className="min-h-[150px] resize-none rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-medium">Delay</Label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        value={node.data.delay || ''}
                                        onChange={(e) => handleChange('delay', e.target.value)}
                                        placeholder="0"
                                        className="w-24 rounded-lg border-gray-200"
                                    />
                                    <span className="text-sm text-gray-500">seconds</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Note Specific */}
                    {node.type === 'NOTE' && (
                        <div className="space-y-2">
                            <Label className="text-gray-600 font-medium">Note Text</Label>
                            <Textarea 
                                value={node.data.label || ''}
                                onChange={(e) => handleChange('label', e.target.value)}
                                placeholder="Enter note..."
                                className="min-h-[200px] bg-[#FFF8E7] border-[#F5E6C8] text-gray-800 placeholder:text-gray-400 rounded-xl resize-none"
                            />
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white">
                    <Button 
                        variant="destructive" 
                        onClick={() => onDelete(node.id)}
                        className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none w-auto px-4"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Step
                    </Button>
                </div>
            </div>

            <TriggerSelectionModal 
                isOpen={isTriggerModalOpen}
                onClose={() => setIsTriggerModalOpen(false)}
                onSelect={handleTriggerSelect}
            />
        </>
    );
}
