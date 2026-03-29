import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';
import Stripe from 'stripe';

// 1. Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  // Initialize Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  try {
    // 2. Get webhook secret from database
    const { data: webhookSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'stripe_webhook_secret')
      .single();

    const webhookSecret = webhookSetting?.value;

    if (!webhookSecret) {
      throw new Error('Webhook secret not found in app_settings');
    }

    // 3. SECURE VERIFICATION using the Stripe Library
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 4. Handle Event Types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: session.client_reference_id || session.metadata?.user_id,
            product_id: session.metadata?.product_id,
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase(),
            status: 'completed',
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name,
            paid_at: new Date().toISOString(),
            metadata: session.metadata,
          })
          .single();

        if (orderError) {
          console.error('Error saving order:', orderError);
          return res.status(500).json({ error: 'Failed to save order' });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await supabase
          .from('orders')
          .update({ status: 'completed', paid_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await supabase
          .from('orders')
          .update({
            refund_status: charge.refunded ? 'full' : 'partial',
            refund_amount: charge.amount_refunded / 100,
            refunded_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', charge.payment_intent as string);
        break;
      }
    }

    return res.status(200).json({ received: true });

  } catch (error: any) {
    console.error('Webhook handler error:', error.message);
    return res.status(400).json({ error: error.message });
  }
}
