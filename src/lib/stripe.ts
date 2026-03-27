import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key not found');
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};
```

---

### **STEP 4: Create Supabase Edge Function for Checkout**

Since we can't run a backend server, we'll use Supabase Edge Functions.

**Action: Create a folder structure:**
```
supabase/
└── functions/
    └── create-checkout/
        └── index.ts
