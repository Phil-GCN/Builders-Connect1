import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, reason, userId } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ error: 'Missing orderId or reason' });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if already refunded
    if (order.refund_status !== 'none') {
      return res.status(400).json({ error: 'Order has already been refunded' });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed orders can be refunded' });
    }

    // Get current Stripe mode
    const { data: modeSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'stripe_mode')
      .single();

    const stripeMode = modeSetting?.value || 'test';

    // Get appropriate secret key
    const secretKeyName = stripeMode === 'live' 
      ? 'stripe_live_secret_key' 
      : 'stripe_test_secret_key';

    const { data: stripeSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', secretKeyName)
      .single();

    if (!stripeSetting?.value) {
      return res.status(500).json({ 
        error: `Stripe ${stripeMode} mode not configured` 
      });
    }

    const stripeSecretKey = stripeSetting.value;

    // Create refund in Stripe
    const refundParams = new URLSearchParams();
    refundParams.append('payment_intent', order.stripe_payment_intent_id);
    refundParams.append('reason', 'requested_by_customer');
    if (reason) {
      refundParams.append('metadata[reason]', reason);
      refundParams.append('metadata[refunded_by]', userId || 'admin');
    }

    console.log('Creating refund for payment intent:', order.stripe_payment_intent_id);

    const stripeResponse = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: refundParams.toString(),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('Stripe refund error:', errorText);
      
      // Parse Stripe error for better user message
      let errorMessage = 'Stripe refund failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Use default message
      }
      
      return res.status(400).json({ 
        error: errorMessage,
        details: errorText 
      });
    }

    const refund = await stripeResponse.json();

    console.log('✅ Refund created in Stripe:', refund.id);

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        refund_status: 'full',
        refund_amount: order.amount,
        refund_reason: reason,
        refunded_at: new Date().toISOString(),
        refunded_by: userId || null,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      // Refund was created in Stripe but database update failed
      // This will be caught by webhook later
      return res.status(200).json({ 
        success: true,
        refundId: refund.id,
        warning: 'Refund processed but database update failed. Will be updated via webhook.'
      });
    }

    console.log('✅ Order updated with refund info');

    // TODO: Send refund confirmation email to customer
    // TODO: Send notification to admin

    return res.status(200).json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      message: 'Refund processed successfully',
    });

  } catch (error: any) {
    console.error('Refund error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
}
