import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

// Disable body parsing - we need raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body
    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');
    const sig = req.headers['stripe-signature'] as string;

    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook secret from database
    const { data: webhookSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'stripe_webhook_secret')
      .single();

    const webhookSecret = webhookSetting?.value;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify Stripe signature
    const crypto = require('crypto');
    const timestamp = req.headers['stripe-signature']?.split(',')[0].split('=')[1];
    const signature = req.headers['stripe-signature']?.split(',')[1].split('=')[1];
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Parse event
    const event = JSON.parse(rawBody);

    console.log('Webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Extract data
        const userId = session.client_reference_id;
        const productId = session.metadata?.product_id;
        const amount = session.amount_total / 100; // Convert from cents
        const currency = session.currency.toUpperCase();
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name;
        const paymentIntentId = session.payment_intent;

        // Save order to database
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            product_id: productId,
            stripe_payment_intent_id: paymentIntentId,
            stripe_checkout_session_id: session.id,
            amount,
            currency,
            status: 'completed',
            customer_email: customerEmail,
            customer_name: customerName,
            paid_at: new Date().toISOString(),
            metadata: session.metadata,
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error saving order:', orderError);
          return res.status(500).json({ error: 'Failed to save order' });
        }

        console.log('Order saved:', order.order_number);

        // TODO: Send confirmation email
        // TODO: Reduce inventory if applicable
        // TODO: Grant access to digital products

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            paid_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const refundAmount = charge.amount_refunded / 100;

        // Update order with refund info
        const { error: refundError } = await supabase
          .from('orders')
          .update({
            refund_status: charge.refunded ? 'full' : 'partial',
            refund_amount: refundAmount,
            refunded_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', charge.payment_intent);

        if (refundError) {
          console.error('Error updating refund:', refundError);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
}
