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

// Generate a unique subdomain using crypto.randomUUID and fallback methods
function generateUniqueSubdomain(baseSubdomain?: string): string {
  if (baseSubdomain && baseSubdomain.trim()) {
    // If user provided a subdomain, use it as-is (validation will happen later)
    return slugify(baseSubdomain.trim());
  }
  
  // Generate unique subdomain using UUID
  try {
    const uuid = crypto.randomUUID();
    const shortUuid = uuid.split('-')[0]; // Use first segment for shorter subdomain
    return `site-${shortUuid}`;
  } catch (e) {
    // Fallback to timestamp + random string if crypto.randomUUID fails
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `site-${timestamp}-${randomStr}`;
  }
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
          available_actions: ['health', 'create-website', 'generate-sitemap', 'update-design', 'generate-from-sitemap', 'attach-site', 'autologin']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      case 'create-website':
        return await handleCreateWebsite(req, { API_BASE, TENWEB_API_KEY, REGION, supabase });
      case 'generate-sitemap':
        return await handleGenerateSitemap(req, { API_BASE, TENWEB_API_KEY, supabase });
      case 'update-design':
        return await handleUpdateDesign(req, { supabase });
      case 'generate-from-sitemap':
        return await handleGenerateFromSitemap(req, { API_BASE, TENWEB_API_KEY, supabase });
      case 'attach-site':
        return await handleAttachSite(req, { supabase });
      case 'autologin':
        return await handleAutologin(req, { API_BASE, TENWEB_API_KEY });
      default:
        console.error(`Unknown action: ${action}`);
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}. Available actions: health, create-website, generate-sitemap, update-design, generate-from-sitemap, attach-site, autologin` }),
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
async function handleCreateWebsite(req: Request, { API_BASE, TENWEB_API_KEY, REGION, supabase }): Promise<Response> {
  const body = await req.json();
  const data = CreateWebsiteSchema.parse(body);

  const adminPassword = generateStrongPassword();
  let subdomain = generateUniqueSubdomain(data.subdomain);
  let lastError = '';
  
  // Retry up to 3 times with different subdomains if we get collision errors
  const maxAttempts = 3;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Creating website attempt ${attempt}/${maxAttempts} with subdomain:`, subdomain);

    try {
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
      }, 3, 60000); // 60 second timeout for website creation

      if (createWebsiteResponse.ok) {
        // Success case
        const websiteData = await createWebsiteResponse.json();
        console.log('Website created successfully:', websiteData);

        // Ensure we have a valid website_id before proceeding
        if (!websiteData.website_id) {
          console.error('Website created but no website_id in response:', websiteData);
          throw new Error('Website created but no website_id returned from 10Web API');
        }

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

        await logEvent(site.id, 'website_created', { website_id: websiteData.website_id, subdomain }, supabase);

        return new Response(
          JSON.stringify({
            siteId: site.id,
            website_id: websiteData.website_id,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Error case - check if it's a subdomain collision
        const errorText = await createWebsiteResponse.text();
        lastError = errorText;
        console.error(`Create website failed (attempt ${attempt}/${maxAttempts}):`, errorText);
        
        if (isSubdomainInUseError(errorText) && attempt < maxAttempts) {
          // Generate a new subdomain and try again
          subdomain = generateUniqueSubdomain();
          console.log(`Subdomain collision detected, retrying with new subdomain: ${subdomain}`);
          
          // Add a small delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        } else {
          // Not a subdomain collision or we've exhausted retries
          throw new Error(`Failed to create website: ${errorText}`);
        }
      }
    } catch (error) {
      console.error(`Website creation attempt ${attempt} failed:`, error);
      lastError = error.message;
      
      // Check if it's a subdomain collision error in the exception message
      if (isSubdomainInUseError(error.message) && attempt < maxAttempts) {
        subdomain = generateUniqueSubdomain();
        console.log(`Subdomain collision in exception, retrying with new subdomain: ${subdomain}`);
        
        // Add a small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      } else if (attempt === maxAttempts) {
        // Last attempt failed, throw the error
        throw error;
      }
      
      // For other errors, retry with the same subdomain (in case it was a network issue)
      console.log(`Non-subdomain error on attempt ${attempt}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // If we get here, all attempts failed
  throw new Error(`Failed to create website after ${maxAttempts} attempts. Last error: ${lastError}`);
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