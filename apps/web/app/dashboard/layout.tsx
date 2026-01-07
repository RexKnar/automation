"use client";

import { Sidebar } from "@/components/sidebar";
import { useUser } from "@/hooks/use-user";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = useUser();

  const handleResend = async () => {
    try {
      await axiosInstance.post('/auth/resend-verification');
      toast.success('Verification email sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    }
  };

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72 h-full flex flex-col">
        {user && !user.emailVerified && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-500 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Your email address is not verified. Please check your inbox.</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleResend} className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 h-auto py-1">
              Resend Email
            </Button>
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
