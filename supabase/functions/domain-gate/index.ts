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

    // Initialize Supabase client with anon key for user auth
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
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    const url = new URL(req.url);
    const siteId = url.searchParams.get('site_id');
    
    if (!siteId) {
      throw new Error("site_id parameter is required");
    }

    // Check if user has active subscription for this site
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', user.id)
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      throw subError;
    }

    logStep("Subscription check", { subscription });

    // Check if subscription is active
    const isActive = subscription && ['active', 'past_due'].includes(subscription.status);
    
    if (!isActive) {
      logStep("Domain access blocked - inactive subscription", { 
        status: subscription?.status || 'none',
        siteId 
      });
      
      return new Response(JSON.stringify({ 
        allowed: false, 
        reason: 'Subscription required for domain access',
        status: subscription?.status || 'none'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    logStep("Domain access allowed", { 
      status: subscription.status,
      plan: subscription.plan_id,
      siteId 
    });

    return new Response(JSON.stringify({ 
      allowed: true, 
      plan: subscription.plan_id,
      status: subscription.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in domain gate", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      allowed: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});