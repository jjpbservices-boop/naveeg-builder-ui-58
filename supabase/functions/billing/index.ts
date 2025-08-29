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
  console.log(`[BILLING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Billing function started");

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

    const { action, plan, site_id, price_id } = await req.json().catch(() => ({}));
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";

    // Create service role client for database queries
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (action === 'create-checkout') {
      // Map plan to price ID from database if plan is provided
      let priceId = price_id;
      if (plan) {
        const { data: priceData, error: priceError } = await supabaseService
          .from('stripe_prices')
          .select('price_id')
          .eq('plan_id', plan)
          .single();
        
        if (priceError || !priceData) {
          throw new Error(`Invalid plan: ${plan}`);
        }
        priceId = priceData.price_id;
      }
      
      if (!priceId) throw new Error("price_id or plan parameter is required");

      logStep("Creating checkout session", { priceId, plan, site_id });

      // Check if customer exists
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customerId;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      }

      // Ensure site_id is provided
      if (!site_id) {
        throw new Error("site_id is required for checkout");
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        automatic_tax: { enabled: true },
        success_url: `${appUrl}/billing?success=1`,
        cancel_url: `${appUrl}/plans?canceled=1`,
        metadata: {
          user_id: user.id,
          site_id: site_id,
        },
      });

      logStep("Checkout session created", { sessionId: session.id, url: session.url });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'create-portal') {
      // Create customer portal session - no need to get from URL since we use JSON body
      let customerId = '';
      if (!customerId) {
        // Find customer by email
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length === 0) {
          throw new Error("No Stripe customer found for this user");
        }
        customerId = customers.data[0].id;
      }

      logStep("Creating customer portal session", { customerId });

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/billing`,
      });

      logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in billing", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});