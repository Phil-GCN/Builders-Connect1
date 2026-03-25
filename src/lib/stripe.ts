import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found');
}

export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;

// Helper to create checkout session
export const createCheckoutSession = async (productId: string, priceId: string) => {
  // This will be implemented when we add Stripe backend
  console.log('Creating checkout for:', productId, priceId);
  // TODO: Call Supabase edge function to create Stripe session
};
