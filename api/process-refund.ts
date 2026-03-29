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

    if (!orderId || !reason || !userId) {
      return res.status(400).json({ error: 'Missing orderId, reason, or userId' });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- START ADMIN PROTECTION BLOCK ---
    // Verify user exists and is an admin (level 3+)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role:roles(level)')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(403).json({ error: 'Unauthorized: User profile not found' });
    }

    // Accessing the nested level via the 'role' relationship alias
    const userRole = userData.role as any;
    const userLevel = userRole?.level;

    if (!userLevel || userLevel < 3) {
      return res.status(403).json({ error: 'Unauthorized: Admin access level 3 required' });
    }
    // --- END ADMIN PROTECTION BLOCK ---

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
      refundParams.append('metadata[refunded_by_id]', userId);
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
      
      let errorMessage = 'Stripe refund failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {}
      
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
        refunded_by: userId,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return res.status(200).json({ 
        success: true,
        refundId: refund.id,
        warning: 'Refund processed but database update failed. Will be updated via webhook.'
      });
    }

    console.log('✅ Order updated with refund info');

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
