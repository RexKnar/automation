"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGoogleBusinessAccounts, useDisconnectGoogle, useConnectGoogle } from "@/hooks/useGoogle";
import { Building2, Chrome } from "lucide-react";

export function GoogleConnectionStatus() {
  const { data: businessAccounts, isLoading } = useGoogleBusinessAccounts();
  const disconnectGoogle = useDisconnectGoogle();
  const connectGoogle = useConnectGoogle();

  const isConnected = businessAccounts?.connected;

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect your Google account?")) {
      await disconnectGoogle.mutateAsync();
    }
  };

  const handleConnect = async () => {
    await connectGoogle.mutateAsync();
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
            <CardTitle>Google Business Profile</CardTitle>
            <CardDescription>Connect your Google Business Profile for enhanced features</CardDescription>
          </div>
          {isConnected && (
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              disabled={disconnectGoogle.isPending}
            >
              {disconnectGoogle.isPending ? "Disconnecting..." : "Disconnect"}
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
                <Building2 className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Google Business Profile</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>

              {businessAccounts?.businesses && businessAccounts.businesses.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Chrome className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-medium">Business Accounts</div>
                    <div className="text-sm text-muted-foreground">
                      {businessAccounts.businesses.length} account(s) connected
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Chrome className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Not connected to Google Business Profile</p>
            <Button
              onClick={handleConnect}
              disabled={connectGoogle.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Chrome className="mr-2 h-4 w-4" />
              {connectGoogle.isPending ? "Connecting..." : "Connect to Google"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
