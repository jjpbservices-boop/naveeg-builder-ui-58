import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DOMAIN-GATE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Domain gate check started");

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { site_id, user_id } = await req.json();
    
    if (!site_id || !user_id) {
      throw new Error("site_id and user_id are required");
    }

    logStep("Checking subscription status", { site_id, user_id });

    // Check if user has active subscription for this site
    const { data: subscription, error } = await supabaseClient
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', user_id)
      .eq('site_id', site_id)
      .maybeSingle();

    if (error) {
      logStep("Error fetching subscription", { error: error.message });
      throw error;
    }

    const hasActiveSubscription = subscription && ['active', 'past_due'].includes(subscription.status);
    
    logStep("Subscription check result", { 
      hasSubscription: !!subscription, 
      status: subscription?.status,
      hasActiveSubscription 
    });

    if (!hasActiveSubscription) {
      logStep("Domain access denied - no active subscription");
      return new Response(JSON.stringify({ 
        allowed: false, 
        reason: 'Active subscription required for domain connection' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    logStep("Domain access granted");
    return new Response(JSON.stringify({ 
      allowed: true, 
      plan: subscription.plan_id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in domain gate", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      allowed: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});