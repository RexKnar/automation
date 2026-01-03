"use client";

import { useFlowStats } from "@/hooks/use-flows";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FlowInsightsPage() {
    const params = useParams();
    const flowId = params.flowId as string;
    const channelId = params.channelId as string;
    const { data: stats, isLoading } = useFlowStats(flowId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link 
                    href={`/dashboard/flows`} 
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Flows
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Flow Insights</h1>
                <p className="text-muted-foreground mt-2">
                    Detailed statistics for your automation flow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Triggered" value={stats?.totalTriggered} />
                <StatCard title="Follow Requests Sent" value={stats?.followMsgSent} />
                <StatCard title="Follows Confirmed" value={stats?.followConfirmed} />
                <StatCard title="Opening Messages Sent" value={stats?.openingMsgSent} />
                <StatCard title="Opening Clicks" value={stats?.openingClicked} />
                <StatCard title="Email Requests Sent" value={stats?.emailReqSent} />
                <StatCard title="Emails Provided" value={stats?.emailProvided} />
                <StatCard title="Links Sent" value={stats?.linkMsgSent} />
                <StatCard title="Link Clicks" value={stats?.linkClicked} />
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="p-6 bg-card border rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-2xl font-bold mt-2">{value ?? 0}</p>
        </div>
    );
}
