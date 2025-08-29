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

    // Create service role client for database queries
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    // Get site_id from request body
    const { site_id } = await req.json().catch(() => ({}));
    if (!site_id) {
      throw new Error("site_id is required");
    }

    logStep("Checking subscription for site", { site_id });

    // Check subscription status for this site - domain blocked unless active/past_due
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', user.id)
      .eq('site_id', site_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      logStep("Error checking subscription", { error: subscriptionError });
      throw subscriptionError;
    }

    // Domain connect is allowed only for active/past_due subscriptions
    const isAllowed = subscription && ['active', 'past_due'].includes(subscription.status);
    
    logStep("Domain gate result", { 
      allowed: isAllowed, 
      status: subscription?.status,
      plan: subscription?.plan_id 
    });

    if (!isAllowed) {
      return new Response(JSON.stringify({ 
        allowed: false, 
        reason: 'Subscription required',
        current_status: subscription?.status || 'none'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    return new Response(JSON.stringify({ 
      allowed: true,
      status: subscription.status,
      plan: subscription.plan_id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in domain gate", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      allowed: false, 
      reason: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});