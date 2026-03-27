import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    // Get publishable key from environment or settings
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key not found');
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export const createCheckoutSession = async (productId: string): Promise<CheckoutSession | null> => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
};
