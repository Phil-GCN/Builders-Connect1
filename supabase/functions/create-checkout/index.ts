import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productId, userId } = await req.json()

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Product not found')
    }

    // Check inventory
    if (product.track_inventory && product.stock_quantity <= 0 && !product.allow_backorders) {
      throw new Error('Product out of stock')
    }

    // Get Stripe secret key from settings
    const { data: stripeSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'stripe_secret_key')
      .single()

    if (!stripeSetting?.value) {
      throw new Error('Stripe not configured')
    }

    // Create Stripe checkout session using fetch (no Stripe SDK needed)
    const stripeSecretKey = stripeSetting.value
    
    // Determine price (check for campaign discount)
    let price = product.price
    if (product.campaign_data?.discount_price) {
      price = product.campaign_data.discount_price
    }

    const checkoutData = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image_url ? [product.image_url] : [],
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/shop/${product.slug}`,
      client_reference_id: userId,
      metadata: {
        product_id: productId,
        product_name: product.name,
        user_id: userId,
      },
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(checkoutData as any).toString(),
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text()
      throw new Error(`Stripe error: ${error}`)
    }

    const session = await stripeResponse.json()

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
