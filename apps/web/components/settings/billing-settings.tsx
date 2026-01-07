import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/payment/payment-modal';
import { Check } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface BillingSettingsProps {
  workspaceId: string;
  currentPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
}

const PLANS = [
  {
    name: 'FREE',
    price: 0,
    features: ['1 Workspace', '100 Automations/mo', 'Basic Support'],
  },
  {
    name: 'PRO',
    price: 999,
    features: ['5 Workspaces', '10,000 Automations/mo', 'Priority Support', 'Remove Branding'],
  },
  {
    name: 'ENTERPRISE',
    price: 4999,
    features: ['Unlimited Workspaces', 'Unlimited Automations', 'Dedicated Account Manager', 'SLA'],
  },
];

export function BillingSettings({ workspaceId, currentPlan }: BillingSettingsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);

  const handleUpgrade = (plan: typeof PLANS[0]) => {
    if (plan.name === currentPlan) return;
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const onPaymentSuccess = async () => {
    if (!selectedPlan) return;
    try {
      await axiosInstance.patch(
        `/workspaces/${workspaceId}/plan`,
        { plan: selectedPlan.name }
      );
      toast.success(`Successfully upgraded to ${selectedPlan.name} plan`);
      window.location.reload(); // Simple reload to refresh state
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Current Plan</h3>
        <p className="text-sm text-muted-foreground">
          You are currently on the <Badge variant="secondary">{currentPlan}</Badge> plan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.name === currentPlan ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">₹{plan.price}</span>/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.name === currentPlan ? 'outline' : 'default'}
                onClick={() => handleUpgrade(plan)}
                disabled={plan.name === currentPlan}
              >
                {plan.name === currentPlan ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Mock Payment History */}
      <div>
        <h3 className="text-lg font-medium mb-4">Payment History</h3>
        <div className="border rounded-md p-4 text-center text-muted-foreground">
          No payment history available.
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planName={selectedPlan.name}
          amount={selectedPlan.price}
          onSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
}
