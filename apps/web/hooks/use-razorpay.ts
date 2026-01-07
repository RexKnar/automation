import { useState } from 'react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const useRazorpay = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                setIsLoaded(true);
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = RAZORPAY_SCRIPT_URL;
            script.onload = () => {
                setIsLoaded(true);
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const openPayment = async (options: any) => {
        const loaded = await loadRazorpay();
        if (!loaded) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

    return { isLoaded, openPayment };
};
