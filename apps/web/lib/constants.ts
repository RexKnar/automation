import { MessageSquare, Users, TrendingUp } from "lucide-react";

export const AUTOMATION_TEMPLATES = [
    {
        id: "new-followers",
        title: "Say hi to new followers",
        description: "Send new followers a one-time welcome message when they hit follow",
        icon: Users,
        type: "Quick Automation",
        tag: "NEW",
        category: "Grow your followers"
    },
    {
        id: "auto-dm",
        title: "Auto-DM links from comments",
        description: "Send a link when people comment on a post or reel",
        icon: MessageSquare,
        type: "Quick Automation",
        tag: "POPULAR",
        category: "Drive traffic"
    },
    {
        id: "story-leads",
        title: "Generate leads with stories",
        description: "Use limited-time offers in your Stories to convert leads",
        icon: TrendingUp,
        type: "Quick Automation",
        category: "Engage your audience"
    },
    {
        id: "auto-send-links",
        title: "Auto-send links in DM",
        description: "Automate DMs to send followers to your website",
        icon: MessageSquare,
        type: "Flow Builder",
        category: "Drive traffic"
    }
];
