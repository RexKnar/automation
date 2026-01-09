import { 
    Zap, 
    Instagram, 
    Plus, 
    ArrowRight, 
    Bot, 
    Split, 
    Shuffle, 
    Clock, 
    X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

export function NodeSelector({ isOpen, onClose, onSelect }: NodeSelectorProps) {
    if (!isOpen) return null;

    const categories = [
        {
            title: "Starting Step",
            items: [
                { id: 'TRIGGER', label: 'Trigger', icon: Zap, color: 'text-green-600' }
            ]
        },
        {
            title: "Content",
            items: [
                { id: 'MESSAGE', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                { id: 'CHANNEL', label: 'Channel', icon: Plus, color: 'text-gray-600' },
                { id: 'START_AUTOMATION', label: 'Start Automation', icon: ArrowRight, color: 'text-green-600' }
            ]
        },
        {
            title: "AI",
            items: [
                { id: 'AI_STEP', label: 'AI Step', icon: Bot, color: 'text-gray-600', badge: 'AI' }
            ]
        },
        {
            title: "Logic",
            items: [
                { id: 'ACTION', label: 'Actions', icon: Zap, color: 'text-orange-500' },
                { id: 'CONDITION', label: 'Condition', icon: Split, color: 'text-blue-500', badge: 'PRO' },
                { id: 'RANDOMIZER', label: 'Randomizer', icon: Shuffle, color: 'text-purple-500', badge: 'PRO' },
                { id: 'DELAY', label: 'Smart Delay', icon: Clock, color: 'text-red-500', badge: 'PRO' }
            ]
        }
    ];

    return (
        <div className="absolute right-6 top-20 z-50 w-[320px] bg-white rounded-xl shadow-2xl border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Add Step</h3>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-6">
                    {categories.map((category, idx) => (
                        <div key={idx}>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">{category.title}</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {category.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onSelect(item.id)}
                                        className="flex flex-col items-start p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group relative"
                                    >
                                        <div className={`p-1.5 rounded-md bg-gray-50 group-hover:bg-white mb-2 ${item.color}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                                            {item.label}
                                        </span>
                                        {item.badge && (
                                            <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                item.badge === 'AI' ? 'bg-black text-white' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
