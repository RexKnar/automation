"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";

export default function ConnectInstagramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<{ authUrl: string }>("/meta/auth");
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Failed to get auth url", error);
      toast.error("Failed to initiate connection");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg mb-6"
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : null}
            Connect Via Meta
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

          <button className="mt-6 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
            See More Options <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
