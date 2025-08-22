import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const TENWEB_API_KEY = Deno.env.get('TENWEB_API_KEY');
const API_BASE = 'https://api.10web.io';
const REGION = 'europe-west3-b';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!TENWEB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables');
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

const AttachSiteSchema = z.object({
  siteId: z.string().uuid(),
});

const AutologinSchema = z.object({
  website_id: z.string(),
  admin_url: z.string(),
});

// Helper functions
function generateStrongPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function logEvent(siteId: string, label: string, data: any = {}) {
  try {
    await supabase
      .from('events')
      .insert({ site_id: siteId, label, data });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

async function fetchWithRetry(url: string, options: any, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
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
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Network error, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/ai-router', '');

    console.log(`AI Router: ${req.method} ${path}`);

    switch (path) {
      case '/create-website':
        return await handleCreateWebsite(req);
      case '/generate-sitemap':
        return await handleGenerateSitemap(req);
      case '/update-design':
        return await handleUpdateDesign(req);
      case '/generate-from-sitemap':
        return await handleGenerateFromSitemap(req);
      case '/attach-site':
        return await handleAttachSite(req);
      case '/autologin':
        return await handleAutologin(req);
      default:
        return new Response(
          JSON.stringify({ error: 'Route not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('AI Router error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCreateWebsite(req: Request): Promise<Response> {
  const body = await req.json();
  const data = CreateWebsiteSchema.parse(body);

  // Generate admin password and subdomain if not provided
  const adminPassword = generateStrongPassword();
  const subdomain = data.subdomain || `site-${Date.now()}`;

  console.log('Creating website with subdomain:', subdomain);

  // Call provider API to create website
  const createWebsiteResponse = await fetchWithRetry(`${API_BASE}/v1/hosting/website`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify({
      subdomain,
      region: REGION,
      site_title: data.siteTitle || 'New Site',
      admin_username: 'admin',
      admin_password: adminPassword,
    }),
  });

  if (!createWebsiteResponse.ok) {
    const error = await createWebsiteResponse.text();
    console.error('Create website failed:', error);
    throw new Error(`Failed to create website: ${error}`);
  }

  const websiteData = await createWebsiteResponse.json();
  console.log('Website created:', websiteData);

  // Store in database
  const { data: site, error: dbError } = await supabase
    .from('sites')
    .insert({
      website_id: websiteData.website_id,
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

  await logEvent(site.id, 'website_created', { website_id: websiteData.website_id, subdomain });

  return new Response(
    JSON.stringify({
      siteId: site.id,
      website_id: websiteData.website_id,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGenerateSitemap(req: Request): Promise<Response> {
  const body = await req.json();
  const { siteId, business_type, business_name, business_description } = GenerateSitemapSchema.parse(body);

  // Load site data
  const { data: site, error: dbError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (dbError || !site) {
    throw new Error('Site not found');
  }

  console.log('Generating sitemap for website:', site.website_id);

  // Call provider API to generate sitemap
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
  });

  if (!sitemapResponse.ok) {
    const error = await sitemapResponse.text();
    console.error('Generate sitemap failed:', error);
    throw new Error(`Failed to generate sitemap: ${error}`);
  }

  const sitemapData = await sitemapResponse.json();
  console.log('Sitemap generated:', sitemapData);

  // Auto-fill SEO fields
  const seo_title = sitemapData.website_title || business_name;
  const seo_description = sitemapData.website_description || business_description.substring(0, 160);
  const seo_keyphrase = sitemapData.website_keyphrase || business_name;
  const website_type = sitemapData.website_type || (business_type === 'ecommerce' ? 'ecommerce' : 'basic');

  // Update site with all response data
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

  await logEvent(siteId, 'sitemap_generated', { unique_id: sitemapData.unique_id });

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

async function handleUpdateDesign(req: Request): Promise<Response> {
  const body = await req.json();
  const data = UpdateDesignSchema.parse(body);

  console.log('Updating design for site:', data.siteId);

  // Update site with design data
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

  await logEvent(data.siteId, 'design_updated', data);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGenerateFromSitemap(req: Request): Promise<Response> {
  const body = await req.json();
  const { siteId } = GenerateFromSitemapSchema.parse(body);

  // Load site data
  const { data: site, error: dbError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (dbError || !site) {
    throw new Error('Site not found');
  }

  console.log('Generating site from sitemap for website:', site.website_id);

  const payload = {
    website_id: site.website_id,
    unique_id: site.unique_id,
    params: {
      business_type: site.business_type,
      business_name: site.business_name,
      business_description: site.business_description,
      colors: site.colors || {
        background_dark: false,
        primary_color: '#FF7A00',
        secondary_color: '#6B7280',
      },
      fonts: {
        primary_font: site.fonts?.body || 'inter',
      },
      pages_meta: site.pages_meta || [],
      website_description: site.seo_description,
      website_keyphrase: site.seo_keyphrase,
      website_title: site.seo_title,
      website_type: site.website_type,
    },
  };

  // Transform pages_meta for API
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

  // Call provider API to generate site from sitemap
  const generateResponse = await fetchWithRetry(`${API_BASE}/v1/ai/generate_site_from_sitemap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': TENWEB_API_KEY,
    },
    body: JSON.stringify(apiPayload),
  });

  if (!generateResponse.ok) {
    const error = await generateResponse.text();
    console.error('Generate site failed:', error);
    throw new Error(`Failed to generate site: ${error}`);
  }

  const generateData = await generateResponse.json();
  console.log('Site generated:', generateData);

  // Update site with response data
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

  await logEvent(siteId, 'site_generated', { url: generateData.url });

  return new Response(
    JSON.stringify({ url: generateData.url }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleAttachSite(req: Request): Promise<Response> {
  // Extract JWT token and validate user
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Invalid or expired token');
  }

  const body = await req.json();
  const { siteId } = AttachSiteSchema.parse(body);

  console.log('Attaching site to user:', user.id);

  // Update site with user_id and owner_email
  const { error: updateError } = await supabase
    .from('sites')
    .update({
      user_id: user.id,
      owner_email: user.email,
    })
    .eq('id', siteId);

  if (updateError) {
    console.error('Failed to attach site:', updateError);
    throw new Error(`Failed to attach site: ${updateError.message}`);
  }

  await logEvent(siteId, 'site_attached', { user_id: user.id, owner_email: user.email });

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleAutologin(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const website_id = url.searchParams.get('website_id');
  const admin_url = url.searchParams.get('admin_url');

  const { website_id: validatedWebsiteId, admin_url: validatedAdminUrl } = 
    AutologinSchema.parse({ website_id, admin_url });

  console.log('Getting autologin URL for website:', validatedWebsiteId);

  // Get autologin URL
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

  await logEvent('', 'autologin_generated', { 
    website_id: validatedWebsiteId, 
    admin_url: validatedAdminUrl 
  });

  return new Response(
    JSON.stringify({ admin_url: autologinData.admin_url }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}