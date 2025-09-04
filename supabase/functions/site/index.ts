import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCors } from '../_shared/cors.ts';
import { tenwebClient } from '../_shared/tenweb.ts';
import { psiClient } from '../_shared/psi.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SiteRequest {
  action: string;
  business_name?: string;
  business_description?: string;
  job_id?: string;
  site_id?: string;
  sitemap?: any[];
  theme?: any;
  url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { action, ...data }: SiteRequest = await req.json();

    switch (action) {
      case 'create-site':
        return await handleCreateSite(req, data);
      case 'get-job':
        return await handleGetJob(req, data);
      case 'generate-from-sitemap':
        return await handleGenerateFromSitemap(req, data);
      case 'attach-user':
        return await handleAttachUser(req, data);
      case 'get-psi':
        return await handleGetPsi(req, data);
      default:
        return new Response(
          JSON.stringify({ error: { code: 'INVALID_ACTION', message: 'Unknown action' } }),
          { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateSite(req: Request, data: { business_name: string; business_description: string }) {
  const { business_name, business_description } = data;

  // 1) Create DB row with status 'creating'
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      status: 'creating',
      meta: {
        business: { name: business_name, description: business_description }
      }
    })
    .select()
    .single();

  if (siteError) throw siteError;

  try {
    // 2) Call 10Web: create AI website from brief
    const tenwebResponse = await tenwebClient.createFromBrief({
      name: business_name,
      description: business_description
    });

    // 3) Update DB: set tenweb_site_id, meta.sitemap, meta.seo
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        tenweb_site_id: tenwebResponse.tenweb_site_id,
        meta: {
          business: { name: business_name, description: business_description },
          sitemap: tenwebResponse.sitemap,
          seo: tenwebResponse.seo
        }
      })
      .eq('id', site.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        site_id: site.id, 
        job_id: tenwebResponse.job_id 
      }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Update site status to error
    await supabase
      .from('sites')
      .update({ status: 'error' })
      .eq('id', site.id);

    throw error;
  }
}

async function handleGetJob(req: Request, data: { job_id: string }) {
  const { job_id } = data;

  try {
    const jobStatus = await tenwebClient.getJobStatus(job_id);
    
    // If job is ready, update any associated sites
    if (jobStatus.status === 'ready') {
      const { error } = await supabase
        .from('sites')
        .update({ status: 'ready' })
        .eq('meta->job_id', job_id);

      if (error) console.error('Error updating site status:', error);
    }

    return new Response(
      JSON.stringify(jobStatus),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }
}

async function handleGenerateFromSitemap(req: Request, data: { site_id: string; sitemap: any[]; theme: any }) {
  const { site_id, sitemap, theme } = data;

  // Get the site's tenweb_site_id
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('tenweb_site_id')
    .eq('id', site_id)
    .single();

  if (siteError || !site) {
    throw new Error('Site not found');
  }

  try {
    // Push sitemap and theme to 10Web to regenerate pages/design
    const response = await tenwebClient.generateFromSitemap({
      tenweb_site_id: site.tenweb_site_id,
      sitemap,
      theme
    });

    // Update site meta with new sitemap and theme
    await supabase
      .from('sites')
      .update({
        meta: {
          sitemap,
          theme
        }
      })
      .eq('id', site_id);

    return new Response(
      JSON.stringify({ ok: true, job_id: response.job_id }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw new Error(`Failed to generate from sitemap: ${error.message}`);
  }
}

async function handleAttachUser(req: Request, data: { site_id: string }) {
  const { site_id } = data;

  // Get user from auth JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'No authorization header' } }),
      { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }),
      { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }

  // Update site with user_id and start trial
  const { error: updateError } = await supabase
    .from('sites')
    .update({
      user_id: user.id,
      plan: 'trial',
      trial_started_at: new Date().toISOString()
    })
    .eq('id', site_id);

  if (updateError) throw updateError;

      return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
}

async function handleGetPsi(req: Request, data: { site_id: string; url: string }) {
  const { site_id, url } = data;

  try {
    // Get PSI metrics for both mobile and desktop
    const [mobileMetrics, desktopMetrics] = await Promise.all([
      psiClient.getMetrics(url, 'mobile'),
      psiClient.getMetrics(url, 'desktop')
    ]);

    // Store metrics in database
    await supabase
      .from('site_metrics')
      .insert([
        {
          site_id,
          kind: 'psi-mobile',
          payload: mobileMetrics
        },
        {
          site_id,
          kind: 'psi-desktop',
          payload: desktopMetrics
        }
      ]);

    return new Response(
      JSON.stringify({
        mobile: mobileMetrics,
        desktop: desktopMetrics
      }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw new Error(`Failed to get PSI metrics: ${error.message}`);
  }
}
