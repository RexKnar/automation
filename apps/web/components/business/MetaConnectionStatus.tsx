"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMetaBusinessAccounts, useDisconnectMeta } from "@/hooks/useMeta";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

export function MetaConnectionStatus() {
  const { data: businessAccounts, isLoading } = useMetaBusinessAccounts();
  const disconnectMeta = useDisconnectMeta();

  const isConnected = businessAccounts?.connected;

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect your Meta account?")) {
      await disconnectMeta.mutateAsync();
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meta Business Suite</CardTitle>
            <CardDescription>Facebook, WhatsApp, and Instagram integration</CardDescription>
          </div>
          {isConnected && (
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              disabled={disconnectMeta.isPending}
            >
              {disconnectMeta.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center gap-2 text-green-500 mb-4">
              <span className="text-xl">✓</span>
              <span className="font-medium">Connected</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Facebook className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Facebook Business Manager</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">WhatsApp Business API</div>
                  <div className="text-sm text-muted-foreground">Ready for automation</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Instagram className="h-5 w-5 text-pink-500" />
                <div>
                  <div className="font-medium">Instagram</div>
                  <div className="text-sm text-muted-foreground">Ready for automation</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Facebook className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Not connected to Meta Business Suite</p>
            <Button
              onClick={() => window.location.href = "/onboarding?step=2"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Facebook className="mr-2 h-4 w-4" />
              Connect Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
