import { useState } from 'react';
import { ArrowLeft, ChevronRight, Check, Plus, Mail, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface CommentTriggerWizardProps {
    data: any;
    onUpdate: (data: any) => void;
    onBack: () => void;
}

const MOCK_POSTS = [
    { id: '1', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=300&fit=crop', title: 'Post 1' },
    { id: '2', image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=300&h=300&fit=crop', title: 'Post 2' },
    { id: '3', image: 'https://images.unsplash.com/photo-1516251193000-18e6586ee186?w=300&h=300&fit=crop', title: 'Post 3' },
    { id: '4', image: 'https://images.unsplash.com/photo-1586810724476-c294fb7ac01b?w=300&h=300&fit=crop', title: 'Post 4' },
    { id: '5', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop', title: 'Post 5' },
    { id: '6', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop', title: 'Post 6' },
];

export function CommentTriggerWizard({ data, onUpdate, onBack }: CommentTriggerWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(data.postId || null);
    const [postSelectionType, setPostSelectionType] = useState<'specific' | 'all' | 'next'>(data.postSelectionType || 'specific');
    
    // Step 2 State
    const [includeKeywords, setIncludeKeywords] = useState<string[]>(data.includeKeywords || []);
    const [excludeKeywords, setExcludeKeywords] = useState<string[]>(data.excludeKeywords || []);
    const [triggerOnAnyComment, setTriggerOnAnyComment] = useState(data.triggerOnAnyComment || false);

    // Step 3 State
    const [publicReplies, setPublicReplies] = useState<string[]>(data.publicReplies || [
        "Info sent! Look in your DMs 📩",
        "Info's sent - look at your DMs 📩",
        "Info delivered! Look in DMs 📝"
    ]);
    const [enablePublicReply, setEnablePublicReply] = useState(data.enablePublicReply !== false); // Default true

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleSave = () => {
        onUpdate({
            ...data,
            postId: selectedPostId,
            postSelectionType,
            includeKeywords,
            excludeKeywords,
            triggerOnAnyComment,
            publicReplies,
            enablePublicReply
        });
        onBack();
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            {/* Header */}
            <div className="p-4 border-b bg-[#E3FCEF] flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={step === 1 ? onBack : () => setStep(step - 1)} className="h-8 w-8 p-0 hover:bg-black/5">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Button>
                <h3 className="font-bold text-lg text-gray-800 flex-1">Post or Reel Comments #{data.id?.slice(-4) || 'New'}</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-black/5">
                    <Edit className="w-4 h-4 text-gray-500" />
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-6">
                <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Step {step} of 3</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-green-600 transition-all duration-300 ease-in-out" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                
                {/* STEP 1: Post Selection */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Which Post or Reel do you want to use in automation?</h2>
                        
                        <div className={`border-2 rounded-xl p-4 transition-all ${postSelectionType === 'specific' ? 'border-green-600 bg-green-50/10' : 'border-gray-200 hover:border-gray-300'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold text-gray-700">Specific Post or Reel</span>
                                <Button variant="link" className="text-blue-600 h-auto p-0">See More</Button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                {MOCK_POSTS.map(post => (
                                    <div 
                                        key={post.id}
                                        onClick={() => {
                                            setSelectedPostId(post.id);
                                            setPostSelectionType('specific');
                                        }}
                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                                    >
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                        <div className={`absolute inset-0 bg-black/20 transition-opacity ${selectedPostId === post.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${selectedPostId === post.id ? 'bg-green-500 border-green-500' : 'bg-white/50'}`}>
                                            {selectedPostId === post.id && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={() => setPostSelectionType('all')}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${postSelectionType === 'all' ? 'border-green-600 bg-green-50/10' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="font-semibold text-gray-700">All Posts or Reels <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded ml-1">PRO</span></span>
                        </button>

                        <button 
                            onClick={() => setPostSelectionType('next')}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${postSelectionType === 'next' ? 'border-green-600 bg-green-50/10' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="font-semibold text-gray-700">Next Post or Reel <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded ml-1">PRO</span></span>
                        </button>
                    </div>
                )}

                {/* STEP 2: Keywords */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">What will start your DM automation?</h2>
                        
                        <div className={`border-2 rounded-xl p-6 transition-all ${!triggerOnAnyComment ? 'border-green-600 bg-green-50/10' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-4" onClick={() => setTriggerOnAnyComment(false)}>
                                <span className="font-semibold text-gray-700">Specific Keywords</span>
                            </div>

                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 bg-white">
                                    <Label className="text-gray-600 mb-2 block">Comments <span className="font-bold text-gray-800">include</span> these Keywords:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {includeKeywords.map((k, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
                                                {k} <X className="w-3 h-3 cursor-pointer" onClick={() => setIncludeKeywords(includeKeywords.filter((_, idx) => idx !== i))} />
                                            </span>
                                        ))}
                                        <button className="px-3 py-1 border border-dashed border-gray-400 rounded-full text-sm text-gray-500 hover:border-gray-600 hover:text-gray-700 flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> Keyword
                                        </button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 bg-white">
                                    <Label className="text-gray-600 mb-2 block">Comments <span className="font-bold text-gray-800">exclude</span> these Keywords:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {excludeKeywords.map((k, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
                                                {k} <X className="w-3 h-3 cursor-pointer" onClick={() => setExcludeKeywords(excludeKeywords.filter((_, idx) => idx !== i))} />
                                            </span>
                                        ))}
                                        <button className="px-3 py-1 border border-dashed border-gray-400 rounded-full text-sm text-gray-500 hover:border-gray-600 hover:text-gray-700 flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> Keyword
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-4">Keywords are not case-sensitive, e.g. "Hello" and "hello" are recognised as the same.</p>
                        </div>

                        <button 
                            onClick={() => setTriggerOnAnyComment(true)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${triggerOnAnyComment ? 'border-green-600 bg-green-50/10' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="font-semibold text-gray-700">Any comment</span>
                        </button>
                    </div>
                )}

                {/* STEP 3: Public Replies */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Would you like to set up Public Reply in the feed?</h2>
                        
                        <div className={`border-2 rounded-xl p-6 transition-all ${enablePublicReply ? 'border-green-600 bg-green-50/10' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-4" onClick={() => setEnablePublicReply(true)}>
                                <span className="font-semibold text-gray-700">Yes, random multiple replies</span>
                            </div>

                            <div className="space-y-3">
                                {publicReplies.map((reply, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Input value={reply} onChange={(e) => {
                                            const newReplies = [...publicReplies];
                                            newReplies[i] = e.target.value;
                                            setPublicReplies(newReplies);
                                        }} className="bg-white" />
                                        <Button variant="ghost" size="sm" onClick={() => setPublicReplies(publicReplies.filter((_, idx) => idx !== i))}>
                                            <X className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                ))}
                                <Button 
                                    variant="outline" 
                                    className="w-full border-dashed border-gray-400 text-gray-500 hover:text-gray-700"
                                    onClick={() => setPublicReplies([...publicReplies, ""])}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> New Replies
                                </Button>
                            </div>
                        </div>

                        <button 
                            onClick={() => setEnablePublicReply(false)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${!enablePublicReply ? 'border-green-600 bg-green-50/10' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="font-semibold text-gray-700">No</span>
                        </button>
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white flex justify-between items-center">
                {step > 1 ? (
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="w-10 h-10 p-0 rounded-lg">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                ) : (
                    <div />
                )}
                
                {step < 3 ? (
                    <Button onClick={handleNext} className="bg-blue-500 hover:bg-blue-600 text-white px-8 rounded-lg">
                        Continue
                    </Button>
                ) : (
                    <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-8 rounded-lg">
                        Save
                    </Button>
                )}
            </div>
        </div>
    );
}

// Helper for X icon since I missed importing it in the component body
function X({ className, onClick }: { className?: string, onClick?: () => void }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
            onClick={onClick}
        >
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
        </svg>
    )
}
