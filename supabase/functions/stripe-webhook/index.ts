import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    logStep("Verifying webhook signature");
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Processing webhook event", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout session completed", { 
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription 
        });

        // Get subscription details
        if (session.subscription && typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const priceId = subscription.items.data[0]?.price.id;
          
          // Get plan_id from stripe_prices table
          const { data: priceData } = await supabaseClient
            .from('stripe_prices')
            .select('plan_id')
            .eq('price_id', priceId)
            .single();

          if (priceData) {
            // Get user_id and site_id from session metadata
            const userId = session.metadata?.user_id;
            const siteId = session.metadata?.site_id;

            logStep("Upserting subscription", {
              userId,
              siteId,
              planId: priceData.plan_id,
              status: subscription.status
            });

            // Upsert subscription
            const { error } = await supabaseClient
              .from('subscriptions')
              .upsert({
                user_id: userId,
                site_id: siteId,
                plan_id: priceData.plan_id,
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                metadata: session.metadata || {}
              }, { onConflict: 'stripe_subscription_id' });

            if (error) {
              logStep("Error upserting subscription", { error: error.message });
              throw error;
            }
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        
        logStep("Processing subscription event", {
          subscriptionId: subscription.id,
          status: subscription.status,
          priceId
        });

        // Get plan_id from stripe_prices table
        const { data: priceData } = await supabaseClient
          .from('stripe_prices')
          .select('plan_id')
          .eq('price_id', priceId)
          .single();

        if (priceData) {
          // Update subscription status
          const updateData = {
            plan_id: priceData.plan_id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id
          };

          if (subscription.trial_end) {
            updateData.trial_end = new Date(subscription.trial_end * 1000).toISOString();
          }

          logStep("Updating subscription", updateData);

          const { error } = await supabaseClient
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            logStep("Error updating subscription", { error: error.message });
            throw error;
          }
        }
        break;
      }

      default:
        logStep("Unhandled webhook event type", { type: event.type });
    }

    logStep("Webhook processed successfully");

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});