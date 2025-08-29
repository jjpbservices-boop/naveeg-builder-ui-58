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
  console.log(`[SYNC-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Subscription sync started");

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

    const { site_id } = await req.json();

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        success: true,
        message: "No Stripe customer found, no subscriptions to sync"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    logStep("Found Stripe subscriptions", { count: subscriptions.data.length });

    let syncedCount = 0;
    let activeSubs = 0;

    for (const subscription of subscriptions.data) {
      try {
        // Get plan_id from price_id
        const priceId = subscription.items.data[0].price.id;
        const { data: priceData, error: priceError } = await supabaseService
          .from('stripe_prices')
          .select('plan_id')
          .eq('price_id', priceId)
          .single();

        if (priceError || !priceData) {
          logStep("Could not find plan for price", { priceId, error: priceError });
          continue;
        }

        // Check if subscription already exists in our database
        const { data: existingSubscription } = await supabaseService
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single();

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
            synced_at: new Date().toISOString(),
            original_status: existingSubscription?.status || 'unknown',
          },
          updated_at: new Date().toISOString(),
        };

        // Upsert subscription
        const { error: upsertError } = await supabaseService
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

        if (upsertError) {
          logStep("Error syncing subscription", { 
            subscriptionId: subscription.id, 
            error: upsertError 
          });
        } else {
          syncedCount++;
          if (['active', 'trialing'].includes(subscription.status)) {
            activeSubs++;
          }
          logStep("Synced subscription", { 
            subscriptionId: subscription.id, 
            status: subscription.status,
            plan: priceData.plan_id
          });
        }
      } catch (error) {
        logStep("Error processing subscription", { 
          subscriptionId: subscription.id, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logStep("Sync completed", { syncedCount, activeSubs, totalFound: subscriptions.data.length });

    return new Response(JSON.stringify({ 
      success: true,
      synced_count: syncedCount,
      active_subscriptions: activeSubs,
      total_found: subscriptions.data.length,
      message: `Synced ${syncedCount} subscriptions, ${activeSubs} active`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in subscription sync", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});