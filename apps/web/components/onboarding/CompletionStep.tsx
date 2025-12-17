"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function CompletionStep() {
  const router = useRouter();

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/50 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          <Sparkles className="inline-block mr-2 h-6 w-6 text-yellow-500" />
          You're All Set!
        </CardTitle>
        <CardDescription className="text-center">
          Your business is now ready for automation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="font-semibold text-lg mb-2">Onboarding Complete!</h3>
          <p className="text-sm text-muted-foreground">
            You can now start automating your WhatsApp and Instagram communications
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Next Steps:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              Set up your first automation workflow
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              Create message templates
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              Configure your chatbot responses
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              Invite team members
            </li>
          </ul>
        </div>

        <Button
          onClick={() => router.push("/dashboard/templates")}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          Go to Templates
        </Button>
      </CardContent>
    </Card>
  );
}
