"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetBusiness } from "@/hooks/useBusiness";
import { BusinessDetailsStep } from "./BusinessDetailsStep";
import { MetaConnectionStep } from "./MetaConnectionStep";
import { AccountSelectionStep } from "./AccountSelectionStep";
import { CompletionStep } from "./CompletionStep";

export function OnboardingWizard() {
  const searchParams = useSearchParams();
  const { data: business, isLoading } = useGetBusiness();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      setCurrentStep(parseInt(stepParam));
    } else if (business && !isLoading) {
      // If business exists but no step param, default to step 2 (Connect Meta)
      // unless they are already fully onboarded, but here we assume they are in the wizard
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [searchParams, business, isLoading]);

  const steps = [
    { number: 1, title: "Business Details" },
    { number: 2, title: "Connect Meta" },
    { number: 3, title: "Select Accounts" },
    { number: 4, title: "Complete" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.number
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-white/20 bg-white/5 text-white/50"
                }`}
              >
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-all ${
                    currentStep > step.number ? "bg-blue-500" : "bg-white/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div>
          {currentStep === 1 && (
            <BusinessDetailsStep onNext={() => setCurrentStep(2)} />
          )}
          {currentStep === 2 && (
            <MetaConnectionStep
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <AccountSelectionStep
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && <CompletionStep />}
        </div>
      </div>
    </div>
  );
}
