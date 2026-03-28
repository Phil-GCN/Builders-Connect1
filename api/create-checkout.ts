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
    const { productId, userId } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({ error: 'Missing productId or userId' });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check inventory
    if (product.track_inventory && product.stock_quantity <= 0 && !product.allow_backorders) {
      return res.status(400).json({ error: 'Product out of stock' });
    }

    // Get current Stripe mode
    const { data: modeSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'stripe_mode')
      .single();

    const stripeMode = modeSetting?.value || 'test';

    // Get appropriate secret key based on mode
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
        error: `Stripe ${stripeMode} mode not configured. Please add ${secretKeyName} in settings.` 
      });
    }

    const stripeSecretKey = stripeSetting.value;

    // Determine price (check for campaign discount)
    let price = product.price;
    if (product.campaign_data?.discount_price) {
      price = product.campaign_data.discount_price;
    }

    // Get base URL from request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'builders-connect1.vercel.app';
    const baseUrl = `${protocol}://${host}`;

    // Build Stripe checkout session parameters
    const sessionParams = new URLSearchParams();
    sessionParams.append('mode', 'payment');
    sessionParams.append('success_url', `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`);
    sessionParams.append('cancel_url', `${baseUrl}/shop/${product.slug}`);
    sessionParams.append('client_reference_id', userId);
    sessionParams.append('payment_method_types[]', 'card');
    sessionParams.append('line_items[0][price_data][currency]', 'usd');
    sessionParams.append('line_items[0][price_data][product_data][name]', product.name);

    if (product.description) {
      sessionParams.append('line_items[0][price_data][product_data][description]', 
        product.description.substring(0, 500));
    }

    if (product.image_url) {
      sessionParams.append('line_items[0][price_data][product_data][images][0]', product.image_url);
    }

    sessionParams.append('line_items[0][price_data][unit_amount]', Math.round(price * 100).toString());
    sessionParams.append('line_items[0][quantity]', '1');
    sessionParams.append('metadata[product_id]', productId);
    sessionParams.append('metadata[user_id]', userId);

    // Call Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sessionParams.toString(),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error('Stripe error:', errorText);
      return res.status(400).json({ error: 'Stripe checkout failed', details: errorText });
    }

    const session = await stripeResponse.json();

    console.log(`✅ Checkout session created in ${stripeMode} mode:`, session.id);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      mode: stripeMode,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
