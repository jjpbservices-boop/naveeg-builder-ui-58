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

    logStep("Verifying session", { sessionId: session_id, frontendSiteId: site_id });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Extract site_id from Stripe metadata (primary source) or fallback to frontend
    const metadataSiteId = session.metadata?.site_id;
    const finalSiteId = metadataSiteId || site_id;
    
    logStep("Retrieved session", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      subscriptionId: session.subscription,
      mode: session.mode,
      metadataSiteId,
      frontendSiteId: site_id,
      finalSiteId
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

      // Get plan_id from price_id first
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

      // Check for existing subscriptions for this user
      logStep("Checking for existing subscriptions for user");
      const { data: existingSubscriptions, error: existingError } = await supabaseService
        .from('subscriptions')
        .select('id, stripe_subscription_id, status, site_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing']);

      if (existingError) {
        logStep("Error checking existing subscriptions", { error: existingError });
        throw new Error(`Error checking existing subscriptions: ${existingError.message}`);
      }

      // Determine the correct site_id to use
      let targetSiteId = finalSiteId;
      
      // If updating an existing subscription, preserve its site_id unless we have a valid new one
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        const existingSiteId = existingSubscriptions[0].site_id;
        if (existingSiteId && !targetSiteId) {
          targetSiteId = existingSiteId;
          logStep("Preserving existing site_id", { existingSiteId });
        }
      }
      
      // Prepare subscription data
      const subscriptionData = {
        user_id: user.id,
        site_id: targetSiteId || null,
        plan_id: priceData.plan_id,
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        metadata: {
          verified_at: new Date().toISOString(),
          session_id: session.id,
          site_id_source: metadataSiteId ? 'stripe_metadata' : 'frontend'
        },
        updated_at: new Date().toISOString(),
      };
      
      logStep("Prepared subscription data", { 
        targetSiteId, 
        planId: priceData.plan_id,
        stripeSubId: subscription.id
      });

      let upsertData;
      
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        // User has existing subscription(s) - update the first one found
        logStep("Found existing subscription, updating it", { 
          existingCount: existingSubscriptions.length,
          existingId: existingSubscriptions[0].id 
        });

        // Cancel any other existing subscriptions in Stripe (but not the current one)
        for (const existingSub of existingSubscriptions) {
          if (existingSub.stripe_subscription_id && existingSub.stripe_subscription_id !== subscription.id) {
            try {
              await stripe.subscriptions.cancel(existingSub.stripe_subscription_id);
              logStep("Canceled old subscription in Stripe", { subscriptionId: existingSub.stripe_subscription_id });
            } catch (cancelError) {
              logStep("Warning: Could not cancel old subscription in Stripe", { 
                subscriptionId: existingSub.stripe_subscription_id, 
                error: cancelError instanceof Error ? cancelError.message : String(cancelError)
              });
            }
          }
        }

        // Update the existing subscription record
        const { data: updateData, error: updateError } = await supabaseService
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', existingSubscriptions[0].id)
          .select()
          .single();

        if (updateError) {
          logStep("Error updating existing subscription", { error: updateError });
          throw new Error(`Failed to update existing subscription: ${updateError.message}`);
        }

        upsertData = updateData;
        logStep("Successfully updated existing subscription");
      } else {
        // No existing subscription - create new one
        logStep("No existing subscription found, creating new one");
        
        const { data: insertData, error: insertError } = await supabaseService
          .from('subscriptions')
          .insert(subscriptionData)
          .select()
          .single();

        if (insertError) {
          logStep("Error inserting new subscription", { error: insertError });
          throw new Error(`Failed to create new subscription: ${insertError.message}`);
        }

        upsertData = insertData;
        logStep("Successfully created new subscription");
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