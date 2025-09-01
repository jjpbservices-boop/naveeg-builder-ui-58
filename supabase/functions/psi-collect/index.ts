// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PSIClient, extractMetrics, type PSIRequest } from '../_shared/psi.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CollectRequest {
  site_id: string;
  url: string;
  strategy?: 'mobile' | 'desktop';
  locale?: string;
  categories?: string[];
}

Deno.serve(async (req) => {
  console.log(`PSI Collect: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const PSI_API_KEY = Deno.env.get('PSI_API_KEY');
    if (!PSI_API_KEY) {
      console.error('PSI Collect: PSI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ ok: false, error: 'PSI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('PSI Collect: Supabase credentials not configured');
      return new Response(
        JSON.stringify({ ok: false, error: 'Database not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { site_id, url, strategy = 'mobile', locale, categories }: CollectRequest = await req.json();

    if (!site_id || !url) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: site_id, url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate strategy
    if (!['mobile', 'desktop'].includes(strategy)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid strategy. Must be mobile or desktop' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`PSI Collect: Running analysis for ${url} (${strategy})`);

    // Initialize PSI client
    const psiClient = new PSIClient(PSI_API_KEY);
    
    // Build PSI request
    const psiRequest: PSIRequest = {
      url,
      strategy,
      locale,
      categories: categories as any, // Type assertion for categories
    };

    // Run PSI audit with retry logic
    const psiResponse = await psiClient.runAuditWithRetry(psiRequest);
    
    // Extract metrics
    const metrics = extractMetrics(psiResponse);

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Insert into site_perf table
    const { data, error } = await supabase
      .from('site_perf')
      .insert({
        site_id,
        strategy,
        analysis_ts: metrics.analysis_ts,
        performance_score: metrics.performance_score,
        crux: metrics.crux,
        lhr: metrics.lhr,
      })
      .select()
      .single();

    if (error) {
      console.error('PSI Collect: Database insert error:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to save PSI data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`PSI Collect: Successfully saved PSI data for site ${site_id}`);

    return new Response(
      JSON.stringify({
        ok: true,
        site_id,
        strategy,
        score: metrics.performance_score,
        analysis_ts: metrics.analysis_ts,
        id: data.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('PSI Collect Error:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message.includes('rate limit')) {
      errorMessage = 'PSI API rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('PSI API error')) {
      errorMessage = error.message;
      statusCode = 502;
    }

    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});