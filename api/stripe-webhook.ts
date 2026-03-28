import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Webhook received:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    console.log('Event type:', event.type);

    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured');
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('Processing checkout session:', session.id);

      // Extract customer details
      const customerEmail = session.customer_details?.email || session.customer_email || '';
      const customerName = session.customer_details?.name || '';

      // Extract metadata
      const userId = session.client_reference_id || session.metadata?.user_id;
      const productId = session.metadata?.product_id;

      const orderData = {
        user_id: userId,
        product_id: productId,
        stripe_payment_intent_id: session.payment_intent || session.id,
        stripe_checkout_session_id: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: (session.currency || 'usd').toUpperCase(),
        status: 'completed',
        customer_email: customerEmail,
        customer_name: customerName,
        paid_at: new Date().toISOString(),
      };

      console.log('Saving order with data:', JSON.stringify(orderData, null, 2));

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error saving order:', orderError);
        return res.status(500).json({ 
          error: 'Failed to save order', 
          details: orderError.message,
          data: orderData 
        });
      }

      console.log('✅ Order saved successfully:', order.order_number);
      return res.status(200).json({ 
        received: true, 
        order_number: order.order_number,
        order_id: order.id 
      });
    }

    // Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      console.log('Updating payment intent:', paymentIntent.id);

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          paid_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (updateError) {
        console.error('Error updating order:', updateError);
      } else {
        console.log('✅ Order status updated');
      }

      return res.status(200).json({ received: true });
    }

    // Handle charge.refunded
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const refundAmount = (charge.amount_refunded || 0) / 100;

      console.log('Processing refund for payment intent:', charge.payment_intent);

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
      } else {
        console.log('✅ Refund processed');
      }

      return res.status(200).json({ received: true });
    }

    console.log('Unhandled event type:', event.type);
    return res.status(200).json({ received: true, unhandled: event.type });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return res.status(400).json({ 
      error: error.message, 
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
