import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRazorpay } from '@/hooks/use-razorpay';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  planName,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const { openPayment } = useRazorpay();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      // 1. Create Order
      const { data: order } = await axiosInstance.post(
        '/payment/order',
        { amount, currency: 'INR' }
      );

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Automation Platform',
        description: `Upgrade to ${planName}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify Payment
            await axiosInstance.post(
              '/payment/verify',
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }
            );
            toast.success('Payment successful!');
            onSuccess();
            onClose();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          // You might want to prefill user details here if available
        },
        theme: {
          color: '#3399cc',
        },
      };

      await openPayment(options);
    } catch (error) {
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Subscription</DialogTitle>
          <DialogDescription>
            You are about to upgrade to the <strong>{planName}</strong> plan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-between items-center text-lg font-medium">
            <span>Total Amount:</span>
            <span>₹{amount}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
