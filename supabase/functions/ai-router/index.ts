import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schemas
const CreateWebsiteSchema = z.object({
  subdomain: z.string().optional(),
  siteTitle: z.string().optional(),
});

const GenerateSitemapSchema = z.object({
  siteId: z.string().uuid(),
  business_type: z.string(),
  business_name: z.string(), 
  business_description: z.string(),
});

const UpdateDesignSchema = z.object({
  siteId: z.string().uuid(),
  colors: z.object({
    primary_color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid HEX color'),
    secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid HEX color'),
    background_dark: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid HEX color'),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  pages_meta: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    sections: z.array(z.object({
      title: z.string()
    })).optional().default([]),
  })),
  website_type: z.enum(['basic', 'ecommerce']),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keyphrase: z.string().optional(),
});

const GenerateFromSitemapSchema = z.object({
  siteId: z.string().uuid(),
});

const GenerateSiteSchema = z.object({
  siteId: z.string().uuid(),
});

const PublishPagesSchema = z.object({
  website_id: z.string(),
});

const SetFrontPageSchema = z.object({
  website_id: z.string(),
  page_id: z.string(),
});

const GetDomainsSchema = z.object({
  website_id: z.string(),
});

const AttachSiteSchema = z.object({
  siteId: z.string().uuid(),
});

const AutologinSchema = z.object({
  website_id: z.string(),
  admin_url: z.string(),
});

// --- helpers ---
const API_BASE = Deno.env.get('TENWEB_API_BASE') || 'https://api.10web.io';
const API_KEY  = Deno.env.get('TENWEB_API_KEY')!;

const H = { 'content-type':'application/json', 'x-api-key': API_KEY };

function slugify(s: string) {
  return (s || 'site')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'').slice(0, 45) || 'site';
}

async function tw(path: string, init: RequestInit & {timeoutMs?: number} = {}) {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 60000);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctl.signal });
    const txt = await res.text();
    const json = txt ? JSON.parse(txt) : null;
    if (!res.ok) throw Object.assign(new Error(json?.message || res.statusText), { res, json });
    return json;
  } finally {
    clearTimeout(id);
  }
}

async function ensureFreeSubdomain(base: string) {
  // try base, else ask API to generate until free
  let sub = base;
  for (let i = 0; i < 6; i++) {
    // check
    try {
      await tw('/v1/hosting/websites/subdomain/check', {
        method:'POST', headers:H, body: JSON.stringify({ subdomain: sub })
      });
      return sub; // ok
    } catch (e:any) {
      // taken → generate
      try {
        const g = await tw('/v1/hosting/websites/subdomain/generate', { method:'POST', headers:H });
        sub = g?.subdomain || `${base}-${crypto.randomUUID().split('-')[0]}`;
      } catch {
        sub = `${base}-${Math.random().toString(36).slice(2,6)}`;
      }
    }
  }
  throw new Error('NO_FREE_SUBDOMAIN');
}

async function findExistingBySub(sub: string) {
  try {
    const list = await tw('/v1/account/websites', { method:'GET', headers:H });
    const hit = (list?.data || []).find((w:any) =>
      w?.site_url?.includes(`${sub}.`) || w?.admin_url?.includes(`${sub}.`));
    return hit ? { website_id: hit.id } : null;
  } catch { return null; }
}

function generateStrongPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

// Check if an error response indicates subdomain is in use
function isSubdomainInUseError(errorText: string): boolean {
  return errorText.includes('subdomain_in_use') || 
         errorText.includes('Subdomain is currently in use') ||
         errorText.includes('subdomain is already taken');
}

async function logEvent(siteId: string, label: string, data: any = {}, supabase: any) {
  try {
    await supabase
      .from('events')
      .insert({ site_id: siteId, label, data });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

async function fetchWithRetry(url: string, options: any, maxRetries = 3, timeoutMs = 30000): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let timeoutId: number | undefined;
    try {
      // Add timeout to each fetch attempt
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (response.status >= 500 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Server error ${response.status}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000;
      if (error.name === 'AbortError') {
        console.log(`Request timed out after ${timeoutMs}ms, retrying in ${delay}ms...`);
      } else {
        console.log(`Network error, retrying in ${delay}ms...`, error);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  console.log(`[AI-Router v1.1] Incoming request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables inside the handler for proper error handling
    const TENWEB_API_KEY = Deno.env.get('TENWEB_API_KEY');
    const API_BASE = 'https://api.10web.io';
    const REGION = 'europe-west3-b';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TENWEB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Route requests based on action in request body
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/ai-router', '');
    
    console.log(`Handling request: ${req.method} ${path}`);
    
    // For non-GET requests, read action from body
    let action = '';
    let requestBody = null;
    if (req.method === 'POST') {
      try {
        const body = await req.text();
        requestBody = JSON.parse(body);
        action = requestBody.action || '';
        
        // Recreate request with the original body for handlers
        req = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: body,
        });
      } catch (e) {
        console.error('Error parsing request body:', e);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else if (req.method === 'GET') {
      action = url.searchParams.get('action') || '';
    }
    
    console.log(`Action: ${action}`);
    
    switch (action) {
      case 'health':
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          available_actions: ['health', 'check-subdomain', 'create-website', 'generate-sitemap', 'update-design', 'generate-site', 'publish-pages', 'set-front-page', 'get-domains', 'autologin', 'attach-site']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      case 'check-subdomain':
        return await handleCheckSubdomain(req, { API_BASE, TENWEB_API_KEY });
      case 'create-website':
        try {
          const result = await handleCreateWebsite(requestBody, supabase);
          if (result instanceof Response) return result;
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (e: any) {
          const code = e?.json?.error?.code || e?.json?.code;
          if (code === 'error.subdomain_in_use2') {
            return new Response(JSON.stringify({ code: 'SUBDOMAIN_IN_USE' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ 
            code: 'CREATE_FAILED', 
            detail: e?.json || e?.message 
          }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      case 'generate-sitemap':
        return await handleGenerateSitemap(req, { API_BASE, TENWEB_API_KEY, supabase });
      case 'update-design':
        return await handleUpdateDesign(req, { supabase });
      case 'generate-site':
        return await handleGenerateSite(req, { API_BASE, TENWEB_API_KEY, supabase });
      case 'publish-pages':
        return await handlePublishPages(req, { API_BASE, TENWEB_API_KEY, supabase });
      case 'set-front-page':
        return await handleSetFrontPage(req, { API_BASE, TENWEB_API_KEY });
      case 'get-domains':
        return await handleGetDomains(req, { API_BASE, TENWEB_API_KEY });
      case 'autologin':
        return await handleAutologin(req, { API_BASE, TENWEB_API_KEY });
      case 'attach-site':
        return await handleAttachSite(req, { supabase });
      default:
        console.error(`Unknown action: ${action}`);
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Available actions: health, check-subdomain, create-website, generate-sitemap, update-design, generate-site, publish-pages, set-front-page, get-domains, autologin, attach-site` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('AI Router error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handler functions with dependencies passed as parameters
async function handleCheckSubdomain(req: Request, { API_BASE, TENWEB_API_KEY }): Promise<Response> {
  const body = await req.json();
  const subdomain = body.subdomain;
  
  if (!subdomain) {
    return new Response(
      JSON.stringify({ error: 'Subdomain is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Checking subdomain availability:', subdomain);

  const checkResponse = await fetchWithRetry(`${API_BASE}/v1/hosting/websites/subdomain/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify({ subdomain }),
  });

  if (!checkResponse.ok) {
    const error = await checkResponse.text();
    console.error('Subdomain check failed:', error);
    throw new Error(`Failed to check subdomain: ${error}`);
  }

  const checkData = await checkResponse.json();
  
  return new Response(
    JSON.stringify(checkData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// --- handler: create-website (idempotent + collision-safe) ---
async function handleCreateWebsite(body: any, supabase?: any) {
  const businessName = body?.businessName || body?.siteTitle || 'New Site';
  const base = slugify(businessName);
  
  // if a previous timed-out attempt actually created the site, reuse
  const reused = await findExistingBySub(base);
  if (reused) {
    // Check if this website is already in our database
    if (supabase) {
      const { data: existingSite } = await supabase
        .from('sites')
        .select('*')
        .eq('website_id', reused.website_id)
        .single();
      
      if (existingSite) {
        return { 
          ok: true, 
          website_id: reused.website_id, 
          subdomain: base,
          siteId: existingSite.id 
        };
      }
    }
    return { ok: true, website_id: reused.website_id, subdomain: base };
  }

  let sub = await ensureFreeSubdomain(base);

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const r = await tw('/v1/hosting/website', {
        method:'POST',
        headers: H,
        body: JSON.stringify({
          subdomain: sub,
          region: 'europe-west3-b',
          site_title: businessName,
          admin_username: 'admin',
          admin_password: crypto.randomUUID().replace(/-/g,'').slice(0,16) + 'Aa1!'
        }),
        timeoutMs: 60000
      });
      
      const website_id = r?.data?.website_id;
      if (!website_id) {
        throw new Error('Website created but no website_id returned from 10Web API');
      }

      // Save to database if supabase client is provided
      if (supabase) {
        const { data: site, error: dbError } = await supabase
          .from('sites')
          .insert({
            website_id,
            business_name: '',
            business_type: '',
            business_description: '',
            status: 'created',
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database insert failed:', dbError);
          throw new Error(`Failed to save website data: ${dbError.message}`);
        }

        await logEvent(site.id, 'website_created', { website_id, subdomain: sub }, supabase);

        return { ok: true, website_id, subdomain: sub, siteId: site.id };
      }
      
      return { ok: true, website_id, subdomain: sub };
    } catch (e:any) {
      const code = e?.json?.error?.code || e?.json?.code;
      if (code === 'error.subdomain_in_use2') {
        // race: get a new subdomain and retry
        try {
          const g = await tw('/v1/hosting/websites/subdomain/generate', { method:'POST', headers:H });
          sub = g?.subdomain || `${base}-${Math.random().toString(36).slice(2,6)}`;
        } catch {
          sub = `${base}-${Math.random().toString(36).slice(2,6)}`;
        }
        continue;
      }
      throw e;
    }
  }
  return new Response(JSON.stringify({ error:'SUBDOMAIN_COLLISION' }), { status: 409 });
}

async function handleGenerateSitemap(req: Request, { API_BASE, TENWEB_API_KEY, supabase }): Promise<Response> {
  const body = await req.json();
  const { siteId, business_type, business_name, business_description } = GenerateSitemapSchema.parse(body);

  const { data: site, error: dbError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (dbError || !site) {
    throw new Error('Site not found');
  }

  console.log('Generating sitemap for website:', site.website_id);

  const sitemapResponse = await fetchWithRetry(`${API_BASE}/v1/ai/generate_sitemap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify({
      website_id: site.website_id,
      params: {
        business_type,
        business_name,
        business_description,
      },
    }),
  }, 3, 45000); // 45 second timeout for sitemap generation

  if (!sitemapResponse.ok) {
    const error = await sitemapResponse.text();
    console.error('Generate sitemap failed:', error);
    throw new Error(`Failed to generate sitemap: ${error}`);
  }

  const sitemapData = await sitemapResponse.json();
  console.log('Sitemap generated:', sitemapData);

  const seo_title = sitemapData.website_title || business_name;
  const seo_description = sitemapData.website_description || business_description.substring(0, 160);
  const seo_keyphrase = sitemapData.website_keyphrase || business_name;
  const website_type = sitemapData.website_type || (business_type === 'ecommerce' ? 'ecommerce' : 'basic');

  const { error: updateError } = await supabase
    .from('sites')
    .update({ 
      unique_id: sitemapData.unique_id,
      pages_meta: sitemapData.pages_meta,
      colors: sitemapData.colors,
      fonts: sitemapData.fonts,
      business_name,
      business_type,
      business_description,
      seo_title,
      seo_description,
      seo_keyphrase,
      website_type,
    })
    .eq('id', siteId);

  if (updateError) {
    console.error('Failed to update site:', updateError);
    throw new Error(`Failed to update site: ${updateError.message}`);
  }

  await logEvent(siteId, 'sitemap_generated', { unique_id: sitemapData.unique_id }, supabase);

  return new Response(
    JSON.stringify({ 
      unique_id: sitemapData.unique_id,
      pages_meta: sitemapData.pages_meta,
      seo: {
        seo_title,
        seo_description,
        seo_keyphrase,
      },
      website_type,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleUpdateDesign(req: Request, { supabase }): Promise<Response> {
  const body = await req.json();
  const data = UpdateDesignSchema.parse(body);

  console.log('Updating design for site:', data.siteId);

  const { error: updateError } = await supabase
    .from('sites')
    .update({
      colors: data.colors,
      fonts: data.fonts,
      pages_meta: data.pages_meta,
      website_type: data.website_type,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keyphrase: data.seo_keyphrase,
    })
    .eq('id', data.siteId);

  if (updateError) {
    console.error('Failed to update design:', updateError);
    throw new Error(`Failed to update design: ${updateError.message}`);
  }

  await logEvent(data.siteId, 'design_updated', data, supabase);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGenerateFromSitemap(req: Request, { API_BASE, TENWEB_API_KEY, supabase }): Promise<Response> {
  const body = await req.json();
  const { siteId } = GenerateFromSitemapSchema.parse(body);

  const { data: site, error: dbError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (dbError || !site) {
    throw new Error('Site not found');
  }

  console.log('Generating site from sitemap for website:', site.website_id);

  const transformedPagesMeta = site.pages_meta?.map((p: any) => ({
    title: p.title,
    sections: (p.sections || []).map((s: any) => s.title)
  })) || [];

  const apiPayload = {
    website_id: site.website_id,
    unique_id: site.unique_id,
    params: {
      business_type: site.business_type,
      business_name: site.business_name, 
      business_description: site.business_description,
      colors: {
        background_dark: site.colors?.background_dark || '#000000',
        primary_color: site.colors?.primary_color || '#FF4A1C',
        secondary_color: site.colors?.secondary_color || '#6B7280',
      },
      fonts: {
        primary_font: site.fonts?.body || 'inter',
      },
      pages_meta: transformedPagesMeta,
      website_title: site.seo_title,
      website_description: site.seo_description,
      website_keyphrase: site.seo_keyphrase,
      website_type: site.website_type,
    },
  };

  const generateResponse = await fetchWithRetry(`${API_BASE}/v1/ai/generate_site_from_sitemap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify(apiPayload),
  }, 3, 60000); // 60 second timeout for site generation

  if (!generateResponse.ok) {
    const error = await generateResponse.text();
    console.error('Generate site failed:', error);
    throw new Error(`Failed to generate site: ${error}`);
  }

  const generateData = await generateResponse.json();
  console.log('Site generated:', generateData);

  const { error: updateError } = await supabase
    .from('sites')
    .update({
      payload: apiPayload,
      status: 'generated',
    })
    .eq('id', siteId);

  if (updateError) {
    console.error('Failed to update site:', updateError);
    throw new Error(`Failed to update site: ${updateError.message}`);
  }

  await logEvent(siteId, 'site_generated', { url: generateData.url }, supabase);

  return new Response(
    JSON.stringify({ url: generateData.url }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleAttachSite(req: Request, { supabase }): Promise<Response> {
  console.log('handleAttachSite called');
  
  const authHeader = req.headers.get('Authorization');
  console.log('Auth header present:', !!authHeader);
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header');
    return new Response(
      JSON.stringify({ error: 'Missing or invalid authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.split(' ')[1];
  console.log('Attempting to validate token...');
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user) {
      console.error('No user found from token');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User validated:', user.id);

    const body = await req.json();
    const { siteId } = AttachSiteSchema.parse(body);

    console.log('Attaching site to user:', user.id, 'Site ID:', siteId);

    const { error: updateError } = await supabase
      .from('sites')
      .update({
        user_id: user.id,
        owner_email: user.email,
      })
      .eq('id', siteId);

    if (updateError) {
      console.error('Failed to attach site:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to attach site', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await logEvent(siteId, 'site_attached', { user_id: user.id, owner_email: user.email }, supabase);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in handleAttachSite:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleAutologin(req: Request, { API_BASE, TENWEB_API_KEY }): Promise<Response> {
  try {
    const body = await req.json();
    const { website_id, admin_url } = body;

    const validationResult = AutologinSchema.safeParse({ website_id, admin_url });
    if (!validationResult.success) {
      console.error('Autologin validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { website_id: validatedWebsiteId, admin_url: validatedAdminUrl } = validationResult.data;

    console.log('Getting autologin URL for website:', validatedWebsiteId);

    const autologinResponse = await fetchWithRetry(`${API_BASE}/v1/account/websites/${validatedWebsiteId}/single?admin_url=${encodeURIComponent(validatedAdminUrl)}`, {
      method: 'GET',
      headers: {
        'x-api-key': TENWEB_API_KEY,
      },
    });

    if (!autologinResponse.ok) {
      const error = await autologinResponse.text();
      console.error('Autologin failed:', error);
      throw new Error(`Failed to get autologin URL: ${error}`);
    }

    const autologinData = await autologinResponse.json();
    console.log('Autologin URL generated:', autologinData);

    return new Response(
      JSON.stringify({ admin_url: autologinData.admin_url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Autologin error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate autologin URL', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGenerateSite(req: Request, { API_BASE, TENWEB_API_KEY, supabase }): Promise<Response> {
  const body = await req.json();
  const { siteId } = GenerateSiteSchema.parse(body);

  const { data: site, error: dbError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (dbError || !site) {
    throw new Error('Site not found');
  }

  console.log('Generating site for website:', site.website_id);

  // Transform pages_meta to the format expected by the 10Web API
  const transformedPagesMeta = site.pages_meta?.map((page: any) => ({
    title: page.title,
    description: page.description || '',
    sections: (page.sections || []).map((section: any) => ({
      section_title: section.section_title || section.title,
      section_description: section.section_description || section.description || ''
    }))
  })) || [];

  const apiPayload = {
    website_id: site.website_id,
    business_type: site.business_type,
    business_name: site.business_name,
    business_description: site.business_description,
    colors: {
      background_dark: site.colors?.background_dark || '#000000',
      primary_color: site.colors?.primary_color || '#FF4A1C', 
      secondary_color: site.colors?.secondary_color || '#6B7280',
    },
    fonts: {
      primary_font: site.fonts?.body || 'Inter',
    },
    pages_meta: transformedPagesMeta,
  };

  console.log('API payload for site generation:', JSON.stringify(apiPayload, null, 2));

  const generateResponse = await fetchWithRetry(`${API_BASE}/v1/ai/generate_site`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify(apiPayload),
  }, 3, 90000); // 90 second timeout for site generation

  if (!generateResponse.ok) {
    const error = await generateResponse.text();
    console.error('Generate site failed:', error);
    throw new Error(`Failed to generate site: ${error}`);
  }

  const generateData = await generateResponse.json();
  console.log('Site generated successfully:', generateData);

  const { error: updateError } = await supabase
    .from('sites')
    .update({
      payload: apiPayload,
      status: 'generated',
      site_url: generateData.url,
    })
    .eq('id', siteId);

  if (updateError) {
    console.error('Failed to update site:', updateError);
    throw new Error(`Failed to update site: ${updateError.message}`);
  }

  await logEvent(siteId, 'site_generated', { url: generateData.url }, supabase);

  return new Response(
    JSON.stringify({ 
      url: generateData.url,
      website_id: site.website_id,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handlePublishPages(req: Request, { API_BASE, TENWEB_API_KEY, supabase }): Promise<Response> {
  const body = await req.json();
  const { website_id } = PublishPagesSchema.parse(body);

  console.log('Publishing pages for website:', website_id);

  // First get list of pages
  const pagesResponse = await fetchWithRetry(`${API_BASE}/v1/builder/websites/${website_id}/pages`, {
    method: 'GET',
    headers: {
      'x-api-key': TENWEB_API_KEY,
    },
  });

  if (!pagesResponse.ok) {
    const error = await pagesResponse.text();
    console.error('Get pages failed:', error);
    throw new Error(`Failed to get pages: ${error}`);
  }

  const pagesData = await pagesResponse.json();
  console.log('Pages data:', pagesData);
  
  const pageIds = pagesData.map((page: any) => page.id);

  // Publish all pages
  const publishResponse = await fetchWithRetry(`${API_BASE}/v1/builder/websites/${website_id}/pages/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify({
      action: 'publish',
      page_ids: pageIds,
    }),
  });

  if (!publishResponse.ok) {
    const error = await publishResponse.text();
    console.error('Publish pages failed:', error);
    throw new Error(`Failed to publish pages: ${error}`);
  }

  const publishData = await publishResponse.json();
  console.log('Pages published successfully:', publishData);

  return new Response(
    JSON.stringify({ 
      success: true, 
      pages: pagesData,
      published_count: pageIds.length 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSetFrontPage(req: Request, { API_BASE, TENWEB_API_KEY }): Promise<Response> {
  const body = await req.json();
  const { website_id, page_id } = SetFrontPageSchema.parse(body);

  console.log('Setting front page for website:', website_id, 'page:', page_id);

  const frontPageResponse = await fetchWithRetry(`${API_BASE}/v1/builder/websites/${website_id}/pages/front/set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify({ page_id }),
  });

  if (!frontPageResponse.ok) {
    const error = await frontPageResponse.text();
    console.error('Set front page failed:', error);
    throw new Error(`Failed to set front page: ${error}`);
  }

  const frontPageData = await frontPageResponse.json();
  console.log('Front page set successfully:', frontPageData);

  return new Response(
    JSON.stringify({ success: true, front_page_id: page_id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGetDomains(req: Request, { API_BASE, TENWEB_API_KEY }): Promise<Response> {
  const body = await req.json();
  const { website_id } = GetDomainsSchema.parse(body);

  console.log('Getting domains for website:', website_id);

  const domainsResponse = await fetchWithRetry(`${API_BASE}/v1/hosting/websites/${website_id}/domain-name`, {
    method: 'GET',
    headers: {
      'x-api-key': TENWEB_API_KEY,
    },
  });

  if (!domainsResponse.ok) {
    const error = await domainsResponse.text();
    console.error('Get domains failed:', error);
    throw new Error(`Failed to get domains: ${error}`);
  }

  const domainsData = await domainsResponse.json();
  console.log('Domains data:', domainsData);

  // Find the default domain
  const defaultDomain = domainsData.find((domain: any) => domain.default === 1);
  
  return new Response(
    JSON.stringify({ 
      domains: domainsData,
      default_domain: defaultDomain,
      admin_url: defaultDomain?.admin_url,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}