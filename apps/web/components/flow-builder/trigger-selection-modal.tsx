import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Instagram, MessageCircle, Zap } from "lucide-react";
import { useState } from "react";

interface TriggerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (triggerType: string) => void;
}

const TRIGGERS = [
    {
        id: 'COMMENT',
        title: 'Post or Reel Comments',
        description: 'User comments on your Post or Reel',
        icon: Instagram,
        category: 'Instagram'
    },
    {
        id: 'STORY_REPLY',
        title: 'Story Reply',
        description: 'User replies to your Story',
        icon: Instagram,
        category: 'Instagram'
    },
    {
        id: 'MESSAGE',
        title: 'Instagram Message',
        description: 'User sends a message',
        icon: MessageCircle,
        category: 'Instagram'
    },
    {
        id: 'ADS',
        title: 'Instagram Ads',
        description: 'User clicks an Instagram Ad',
        icon: Instagram,
        category: 'Instagram',
        badge: 'PRO'
    },
    {
        id: 'LIVE_COMMENTS',
        title: 'Live Comments',
        description: 'User comments on your Live',
        icon: Instagram,
        category: 'Instagram'
    },
    {
        id: 'REF_URL',
        title: 'Instagram Ref URL',
        description: 'User clicks a referral link',
        icon: Instagram,
        category: 'Instagram'
    }
];

export function TriggerSelectionModal({ isOpen, onClose, onSelect }: TriggerSelectionModalProps) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Instagram");

    const filteredTriggers = TRIGGERS.filter(t => 
        t.category === selectedCategory && 
        (t.title.toLowerCase().includes(search.toLowerCase()) || 
         t.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[600px] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">Start automation when...</DialogTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search in Instagram" 
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 border-r bg-gray-50/50 p-4 space-y-2">
                        <button 
                            onClick={() => setSelectedCategory("Instagram")}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                selectedCategory === "Instagram" 
                                ? "bg-red-50 text-red-600" 
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Instagram className="w-4 h-4" />
                            Instagram
                        </button>
                        <button 
                            onClick={() => setSelectedCategory("Contact Events")}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                selectedCategory === "Contact Events" 
                                ? "bg-blue-50 text-blue-600" 
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Zap className="w-4 h-4" />
                            Contact Events
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="mb-4">
                            <h3 className="font-semibold text-lg">Triggers</h3>
                            <p className="text-sm text-muted-foreground">Specific Instagram event that starts your automation.</p>
                        </div>

                        <div className="space-y-3">
                            {filteredTriggers.map((trigger) => (
                                <button
                                    key={trigger.id}
                                    onClick={() => onSelect(trigger.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border hover:border-indigo-500 hover:shadow-sm transition-all text-left group bg-white"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 flex items-center justify-center flex-shrink-0 text-white">
                                        <trigger.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {trigger.title}
                                            </span>
                                            {trigger.badge && (
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    {trigger.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                            {trigger.description}
                                        </h4>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
