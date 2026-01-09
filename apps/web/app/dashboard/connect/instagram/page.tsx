"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, CheckCircle } from "lucide-react";
import axios from "@/lib/axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { Suspense } from "react";

function ConnectInstagramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setShowSuccessModal(true);
    } else if (status === "error") {
      toast.error("Failed to connect Instagram account");
    }
  }, [searchParams]);

  const handleInstagramConnect = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<{ authUrl: string }>("/meta/auth/instagram");
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Failed to get instagram auth url", error);
      toast.error("Failed to initiate instagram connection");
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={handleSuccessClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Connection Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your Instagram account has been successfully connected to ReXocial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleSuccessClose} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Left Side - Illustration */}
      <div className="w-1/2 p-12 flex flex-col justify-center border-r dark:border-gray-800">
        <div className="max-w-md mx-auto">
          <div className="relative w-64 h-64 mb-8">
            <Image
              src="/images/connect-instagram.png" 
              alt="Connect Instagram"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Connect Instagram
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Use your Instagram account to connect to ReXocial.
          </p>
          <button 
            onClick={() => router.push("/dashboard/connect")}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            &lt; Choose Another Channel
          </button>
        </div>
      </div>

      {/* Right Side - Action */}
      <div className="w-1/2 p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            A few steps in
          </h2>
          <p className="text-muted-foreground mb-6">
            We&apos;ll take you to Meta to connect. Just set your permissions, and your Instagram account will be linked to ReXocial.
          </p>

          <Button 
            className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white h-12 text-lg mb-6"
            onClick={handleInstagramConnect}
            disabled={isLoading}
          >
            {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : null}
            Connect via Instagram
          </Button>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex items-center justify-between border border-gray-100 dark:border-gray-800">
            <div className="text-sm text-muted-foreground">
              ReXocial is a trusted<br />Meta Business Partner
            </div>
            <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-blue-600">
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5.01 3.69 9.12 8.5 9.9v-7H7.97v-2.97h2.53v-2.15c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.97h-2.33v7c4.81-.79 8.5-4.9 8.5-9.9 0-5.53-4.5-10.02-10-10.02z" />
              </svg>
              Meta<br /><span className="text-xs font-normal text-muted-foreground">Business Partner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectInstagramPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <ConnectInstagramContent />
    </Suspense>
  );
}
