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

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
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

    // Parse JSON body with proper error handling
    let requestBody;
    try {
      const rawBody = await req.text();
      logStep("Raw request body", { body: rawBody });
      
      if (!rawBody) {
        throw new Error("Empty request body");
      }
      
      requestBody = JSON.parse(rawBody);
      logStep("Parsed request body", requestBody);
    } catch (parseError) {
      const errorMsg = `Failed to parse JSON body: ${parseError instanceof Error ? parseError.message : String(parseError)}`;
      logStep("JSON parsing error", { error: errorMsg });
      throw new Error(errorMsg);
    }
    
    const { action, plan, site_id, customer_id } = requestBody;
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";
    
    // Validate required action parameter
    if (!action) {
      throw new Error("Missing required 'action' parameter in request body");
    }
    
    logStep("Request parameters", { action, plan, site_id, customer_id });

    // Create service role client for database queries
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (action === 'create-checkout') {
      if (!plan || !site_id) {
        throw new Error("plan and site_id parameters are required");
      }

      logStep("Creating checkout session", { plan, site_id });

      // Map plan to price ID from database
      const { data: priceData, error: priceError } = await supabaseService
        .from('stripe_prices')
        .select('price_id')
        .eq('plan_id', plan)
        .single();
      
      logStep("Price lookup result", { priceData, priceError });
      
      if (priceError || !priceData) {
        throw new Error(`Invalid plan: ${plan}. Error: ${priceError?.message}`);
      }
      
      const priceId = priceData.price_id;

      // Check if customer exists
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customerId;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
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
      // Create customer portal session
      let customerId = customer_id;
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