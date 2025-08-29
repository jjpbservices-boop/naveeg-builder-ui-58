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
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    logStep("Payment verification started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { session_id, site_id } = await req.json();
    if (!session_id) {
      throw new Error("session_id is required");
    }

    logStep("Verifying session", { sessionId: session_id, siteId: site_id });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Retrieved session", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      subscriptionId: session.subscription,
      mode: session.mode
    });

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Payment not completed. Status: ${session.payment_status}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If it's a subscription, get the subscription details
    if (session.mode === 'subscription' && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      logStep("Retrieved subscription", { 
        subscriptionId: subscription.id,
        status: subscription.status,
        customerId: subscription.customer
      });

      // Create service role client for database operations
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Cancel any existing active subscriptions for this user to prevent duplicates
      logStep("Checking for existing active subscriptions");
      const { data: existingSubscriptions, error: existingError } = await supabaseService
        .from('subscriptions')
        .select('id, stripe_subscription_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .neq('stripe_subscription_id', subscription.id);

      if (existingError) {
        logStep("Error checking existing subscriptions", { error: existingError });
      } else if (existingSubscriptions && existingSubscriptions.length > 0) {
        logStep("Found existing subscriptions to cancel", { count: existingSubscriptions.length });
        
        // Cancel existing subscriptions in Stripe first
        for (const existingSub of existingSubscriptions) {
          if (existingSub.stripe_subscription_id) {
            try {
              await stripe.subscriptions.cancel(existingSub.stripe_subscription_id);
              logStep("Canceled subscription in Stripe", { subscriptionId: existingSub.stripe_subscription_id });
            } catch (cancelError) {
              logStep("Warning: Could not cancel subscription in Stripe", { 
                subscriptionId: existingSub.stripe_subscription_id, 
                error: cancelError instanceof Error ? cancelError.message : String(cancelError)
              });
            }
          }
        }

        // Update existing subscriptions to canceled status in database
        const { error: updateError } = await supabaseService
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .neq('stripe_subscription_id', subscription.id);

        if (updateError) {
          logStep("Error updating existing subscriptions", { error: updateError });
        } else {
          logStep("Successfully canceled existing subscriptions in database");
        }
      }

      // Get plan_id from price_id
      const priceId = subscription.items.data[0].price.id;
      const { data: priceData, error: priceError } = await supabaseService
        .from('stripe_prices')
        .select('plan_id')
        .eq('price_id', priceId)
        .single();

      if (priceError || !priceData) {
        logStep("Error finding plan for price", { priceId, error: priceError });
        throw new Error(`Could not find plan for price ${priceId}`);
      }

      // Prepare subscription data
      const subscriptionData = {
        user_id: user.id,
        site_id: site_id || null,
        plan_id: priceData.plan_id,
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        metadata: {
          verified_at: new Date().toISOString(),
          session_id: session.id,
        },
        updated_at: new Date().toISOString(),
      };

      logStep("Upserting subscription", subscriptionData);

      // Upsert subscription by stripe_subscription_id
      const { data: upsertData, error: upsertError } = await supabaseService
        .from('subscriptions')
        .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })
        .select()
        .single();

      if (upsertError) {
        logStep("Error upserting subscription", { error: upsertError });
        throw new Error(`Failed to update subscription: ${upsertError.message}`);
      }

      logStep("Subscription updated successfully", { subscriptionId: subscription.id });

      return new Response(JSON.stringify({ 
        success: true,
        subscription: upsertData,
        message: `Payment verified and subscription activated`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For one-time payments
    return new Response(JSON.stringify({ 
      success: true,
      message: "Payment verified successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in payment verification", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});