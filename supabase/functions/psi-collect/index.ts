// deno-lint-ignore-file no-explicit-any
import { PSIClient, extractMetrics, type PSIRequest } from '../_shared/psi.ts';
import { validateStrategy, validatePsiCategories } from '../_shared/sanitize.ts';
import { insertSitePerf } from '../_shared/supabase.ts';

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

    const { site_id, url, strategy = 'mobile', locale, categories }: CollectRequest = await req.json();

    if (!site_id || !url) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: site_id, url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate strategy
    if (!validateStrategy(strategy)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid strategy. Must be mobile or desktop' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate categories if provided
    if (categories && !validatePsiCategories(categories)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid categories. Must be PERFORMANCE, ACCESSIBILITY, BEST_PRACTICES, or SEO' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`PSI Collect: Running analysis for ${url} (${strategy})`);

    // Initialize PSI client
    const psiClient = new PSIClient(PSI_API_KEY);
    
    // Build PSI request with only allowed parameters
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

    // Insert into site_perf table using shared utility
    const data = await insertSitePerf({
      site_id,
      strategy,
      analysis_ts: metrics.analysis_ts,
      performance_score: metrics.performance_score,
      crux: metrics.crux,
      lhr: metrics.lhr,
    });

    console.log(`PSI Collect: Successfully saved PSI data for site ${site_id}, record ${data.id}`);

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