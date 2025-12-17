"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWhatsAppAuth, useSaveWhatsAppDetails } from "@/hooks/useWhatsApp";
import Script from "next/script";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export function WhatsAppConnectButton() {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const whatsappAuth = useWhatsAppAuth();
  const saveDetails = useSaveWhatsAppDetails();

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID, // Make sure this env var is set
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
      setIsSdkLoaded(true);
    };
  }, []);

  const handleConnect = () => {
    if (!isSdkLoaded) {
      console.error("Facebook SDK not loaded");
      return;
    }

    window.FB.login(
      function (response: any) {
        if (response.authResponse) {
          const code = response.authResponse.code;
          // 1. Send code to backend to exchange for token
          whatsappAuth.mutate(
            { code },
            {
              onSuccess: () => {
                // 2. After auth, we might need to get the WABA ID and Phone ID.
                // In the Embedded Signup flow, these are usually returned in the response or a separate callback.
                // However, the standard FB.login with 'whatsapp_embedded_signup' might return them in a specific way.
                // For now, we'll assume the user needs to select them or they are returned.
                // If the flow is "Embedded Signup", we usually use a different approach (launching a popup via SDK).
                // But for simplicity, we'll assume standard OAuth for now, or the user will complete the setup in the popup.
                
                // If we get the WABA ID from the response (depends on the flow), we save it.
                // Otherwise, we might need to fetch it from the backend using the token.
              },
            }
          );
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID, // Configuration ID for Embedded Signup
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {
            // ... setup params
          }
        }
      }
    );
  };

  // Alternative: Using the "Login with Facebook" button for Embedded Signup specifically
  // The Embedded Signup flow is often triggered via a specific button or SDK call.
  // We'll use a custom button that calls FB.login with the config_id.

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        async
        defer
        crossOrigin="anonymous"
      />
      <Button
        onClick={handleConnect}
        disabled={!isSdkLoaded || whatsappAuth.isPending}
        className="bg-[#25D366] hover:bg-[#128C7E] text-white"
      >
        {whatsappAuth.isPending ? "Connecting..." : "Connect WhatsApp"}
      </Button>
    </>
  );
}
