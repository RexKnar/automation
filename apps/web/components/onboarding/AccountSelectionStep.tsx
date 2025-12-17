"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetaWhatsAppAccounts, useMetaInstagramAccounts } from "@/hooks/useMeta";
import { useUpdateOnboardingStep } from "@/hooks/useBusiness";
import { Check } from "lucide-react";

interface AccountSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function AccountSelectionStep({ onNext, onBack }: AccountSelectionStepProps) {
  const { data: whatsappData } = useMetaWhatsAppAccounts();
  const { data: instagramData } = useMetaInstagramAccounts();
  const updateStep = useUpdateOnboardingStep();

  const [selectedWhatsApp, setSelectedWhatsApp] = useState<string | null>(null);
  const [selectedInstagram, setSelectedInstagram] = useState<string | null>(null);

  const handleContinue = async () => {
    await updateStep.mutateAsync({ step: 4 });
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/50 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Select Accounts</CardTitle>
        <CardDescription>
          Choose which WhatsApp and Instagram accounts to use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WhatsApp Accounts */}
        <div className="space-y-3">
          <h3 className="font-semibold">WhatsApp Business Accounts</h3>
          {whatsappData?.phoneNumbers?.length > 0 ? (
            <div className="space-y-2">
              {whatsappData.phoneNumbers.map((phone: any) => (
                <button
                  key={phone.id}
                  onClick={() => setSelectedWhatsApp(phone.id)}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    selectedWhatsApp === phone.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium">{phone.verified_name || phone.display_phone_number}</div>
                      <div className="text-sm text-muted-foreground">{phone.display_phone_number}</div>
                    </div>
                    {selectedWhatsApp === phone.id && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-4 bg-white/5 rounded-lg">
              No WhatsApp accounts found. You can add one later.
            </div>
          )}
        </div>

        {/* Instagram Accounts */}
        <div className="space-y-3">
          <h3 className="font-semibold">Instagram Accounts</h3>
          {instagramData?.accounts?.length > 0 ? (
            <div className="space-y-2">
              {instagramData.accounts.map((account: any) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedInstagram(account.id)}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    selectedInstagram === account.id
                      ? "border-pink-500 bg-pink-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">@{account.username}</div>
                    </div>
                    {selectedInstagram === account.id && (
                      <Check className="h-5 w-5 text-pink-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-4 bg-white/5 rounded-lg">
              No Instagram accounts found. You can add one later.
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={updateStep.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {updateStep.isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
