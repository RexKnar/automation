"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetaAuth, useMetaBusinessAccounts } from "@/hooks/useMeta";
import { Facebook } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ManualConnectModal } from "../ManualConnectModal";
import { useState } from "react";

interface MetaConnectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function MetaConnectionStep({ onNext, onBack }: MetaConnectionStepProps) {
  const searchParams = useSearchParams();
  const { data: authData, refetch: getAuthUrl } = useMetaAuth();
  const { data: businessAccounts, refetch: checkConnection } = useMetaBusinessAccounts();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  useEffect(() => {
    // Check if we just returned from Meta OAuth
    const status = searchParams.get("status");
    if (status === "success") {
      checkConnection();
    }
  }, [searchParams, checkConnection]);

  const handleConnect = async () => {
    const result = await getAuthUrl();
    if (result.data?.authUrl) {
      window.location.href = result.data.authUrl;
    }
  };

  const isConnected = businessAccounts?.connected;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/50 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Connect Meta Business Suite</CardTitle>
        <CardDescription>
          Connect your Facebook Business Manager to enable WhatsApp and Instagram automation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Facebook className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Meta Business Suite</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to manage WhatsApp Business API and Instagram
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Access WhatsApp Business accounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Manage Instagram accounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Send automated messages
                </li>
              </ul>

                <Button
                onClick={handleConnect}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Facebook className="mr-2 h-4 w-4" />
                Connect with Facebook
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/50 px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsManualModalOpen(true)}
                className="w-full"
              >
                Connect Manually (Access Token)
              </Button>
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={onBack}>
                Back
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <div className="text-green-500 text-5xl mb-2">✓</div>
              <h3 className="font-semibold text-lg mb-2">Successfully Connected!</h3>
              <p className="text-sm text-muted-foreground">
                Your Meta Business account is now connected
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={onNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <ManualConnectModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => checkConnection()}
      />
    </Card>
  );
}
