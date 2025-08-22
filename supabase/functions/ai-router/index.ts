// supabase/functions/ai-router/index.ts
// Complete 2-step onboarding Edge Function router

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const API_BASE = Deno.env.get('TENWEB_API_BASE') || 'https://api.10web.io';
const API_KEY = Deno.env.get('TENWEB_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };

  const J = (code: number, data: unknown) =>
    new Response(JSON.stringify(data), { 
      status: code, 
      headers: { 'content-type': 'application/json', ...cors } 
    });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const url = new URL(req.url);
  let body: any = {};
  
  if (req.method === 'POST') {
    try { 
      body = await req.json(); 
    } catch { 
      body = {}; 
    }
  }
  
  const action = url.searchParams.get('action') ?? body.action ?? '';

  // Shared helpers
  const tw = async (path: string, init: RequestInit & { timeoutMs?: number } = {}) => {
    const ctl = new AbortController();
    const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 120000);
    
    try {
      const res = await fetch(`${API_BASE}${path}`, { 
        ...init, 
        signal: ctl.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY,
          ...init.headers
        }
      });
      
      const txt = await res.text();
      const json = txt ? JSON.parse(txt) : null;
      
      if (!res.ok) throw { status: res.status, json };
      return json;
    } finally { 
      clearTimeout(id); 
    }
  };

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 45) || 'site';
  };

  const listSites = async () => {
    try {
      return await tw('/v1/account/websites', { method: 'GET', timeoutMs: 30000 });
    } catch {
      return { data: [] };
    }
  };

  const findBySub = async (subdomain: string) => {
    const sites = await listSites();
    return sites.data?.find((site: any) => 
      site.site_url?.includes(`${subdomain}.`) || 
      site.admin_url?.includes(`${subdomain}.`)
    );
  };

  const ensureFreeSub = async (base: string): Promise<string> => {
    let sub = base;
    
    for (let i = 0; i < 6; i++) {
      try {
        await tw('/v1/hosting/websites/subdomain/check', { 
          method: 'POST', 
          body: JSON.stringify({ subdomain: sub }), 
          timeoutMs: 15000 
        });
        return sub;
      } catch {
        try {
          const g = await tw('/v1/hosting/websites/subdomain/generate', { 
            method: 'POST', 
            timeoutMs: 15000 
          });
          sub = g?.subdomain || `${base}-${crypto.randomUUID().slice(0, 8)}`;
        } catch {
          sub = `${base}-${Date.now().toString(36)}`;
        }
      }
    }
    
    throw { code: 'NO_FREE_SUBDOMAIN' };
  };

  // Health check
  if (req.method === 'GET' && action === 'health') {
    return J(200, { 
      status: 'healthy', 
      timestamp: new Date().toISOString(), 
      available_actions: ['create-website', 'generate-sitemap', 'update-design', 'generate-from-sitemap', 'publish-and-frontpage']
    });
  }

  // Create website (idempotent, collision-safe, fast return)
  if (req.method === 'POST' && action === 'create-website') {
    try {
      const businessName = body.businessName || 'New Site';
      const base = slugify(businessName);

      // Check if site already exists
      const existing = await findBySub(base);
      if (existing) {
        return J(200, { 
          ok: true, 
          website_id: existing.id, 
          subdomain: base, 
          reused: true 
        });
      }

      const sub = await ensureFreeSub(base);
      
      try {
        const result = await tw('/v1/hosting/website', {
          method: 'POST',
          body: JSON.stringify({
            subdomain: sub,
            region: 'europe-west3-b',
            site_title: businessName,
            admin_username: 'admin',
            admin_password: crypto.randomUUID().replace(/-/g, '').slice(0, 16) + 'Aa1!'
          }),
          timeoutMs: 25000
        });

        return J(200, { 
          ok: true, 
          website_id: result?.data?.website_id, 
          subdomain: sub, 
          reused: false 
        });
        
      } catch (createError: any) {
        // If creation times out, poll for the site
        if (createError.name === 'AbortError') {
          for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const polled = await findBySub(sub);
            if (polled) {
              return J(200, { 
                ok: true, 
                website_id: polled.id, 
                subdomain: sub, 
                reused: false 
              });
            }
          }
        }

        const code = createError?.json?.error?.code;
        if (code === 'error.subdomain_in_use2') {
          return J(409, { code: 'SUBDOMAIN_IN_USE' });
        }
        
        throw createError;
      }
      
    } catch (error: any) {
      console.error('Create website error:', error);
      return J(502, { 
        code: 'CREATE_FAILED', 
        detail: error?.json ?? error?.message ?? error 
      });
    }
  }

  // Generate sitemap
  if (req.method === 'POST' && action === 'generate-sitemap') {
    try {
      const { website_id, params } = body;
      
      if (!website_id || !params) {
        return J(400, { error: 'Missing website_id or params' });
      }

      const result = await tw('/v1/ai/generate_sitemap', {
        method: 'POST',
        body: JSON.stringify({ website_id, params }),
        timeoutMs: 90000
      });

      // Normalize response keys
      const normalized = {
        unique_id: result.unique_id,
        pages_meta: result.pages_meta || [],
        seo: {
          website_title: result.seo?.website_title || params.business_name,
          website_description: result.seo?.website_description || params.business_description,
          website_keyphrase: result.seo?.website_keyphrase || params.business_name
        },
        colors: {
          primary_color: result.colors?.primary_color || '#FF7A00',
          secondary_color: result.colors?.secondary_color || '#1E62FF',
          background_dark: result.colors?.background_dark || '#121212'
        },
        fonts: {
          primary_font: result.fonts?.primary_font || 'Inter'
        },
        website_type: params.business_type === 'ecommerce' ? 'ecommerce' : 'basic'
      };

      return J(200, normalized);
      
    } catch (error: any) {
      console.error('Generate sitemap error:', error);
      return J(502, { 
        code: 'GENERATE_SITEMAP_FAILED', 
        detail: error?.json ?? error?.message ?? error 
      });
    }
  }

  // Update design (DB only, no 10Web call)
  if (req.method === 'POST' && action === 'update-design') {
    try {
      const { siteId, design } = body;
      
      if (!siteId || !design) {
        return J(400, { error: 'Missing siteId or design' });
      }

      // Validate HEX colors
      const hexPattern = /^#[A-Fa-f0-9]{6}$/;
      if (design.colors) {
        const { primary_color, secondary_color, background_dark } = design.colors;
        if (primary_color && !hexPattern.test(primary_color)) {
          return J(400, { error: 'Invalid primary_color format' });
        }
        if (secondary_color && !hexPattern.test(secondary_color)) {
          return J(400, { error: 'Invalid secondary_color format' });
        }
        if (background_dark && !hexPattern.test(background_dark)) {
          return J(400, { error: 'Invalid background_dark format' });
        }
      }

      // Update in sites table
      const { error } = await supabase
        .from('sites')
        .update({
          colors: design.colors,
          fonts: design.fonts,
          pages_meta: design.pages_meta,
          seo_title: design.seo?.title,
          seo_description: design.seo?.description,
          seo_keyphrase: design.seo?.keyphrase,
          website_type: design.website_type,
          updated_at: new Date().toISOString()
        })
        .eq('website_id', siteId);

      if (error) {
        console.error('Supabase update error:', error);
        return J(500, { error: 'Failed to update design' });
      }

      return J(200, { ok: true });
      
    } catch (error: any) {
      console.error('Update design error:', error);
      return J(500, { 
        code: 'UPDATE_DESIGN_FAILED', 
        detail: error?.message ?? error 
      });
    }
  }

  // Generate from sitemap
  if (req.method === 'POST' && action === 'generate-from-sitemap') {
    try {
      const { website_id, unique_id, params } = body;
      
      if (!website_id || !unique_id || !params) {
        return J(400, { error: 'Missing website_id, unique_id, or params' });
      }

      await tw('/v1/ai/generate_site_from_sitemap', {
        method: 'POST',
        body: JSON.stringify({ website_id, unique_id, params }),
        timeoutMs: 120000
      });

      return J(200, { ok: true });
      
    } catch (error: any) {
      console.error('Generate from sitemap error:', error);
      return J(502, { 
        code: 'GENERATE_FROM_SITEMAP_FAILED', 
        detail: error?.json ?? error?.message ?? error 
      });
    }
  }

  // Publish and set frontpage
  if (req.method === 'POST' && action === 'publish-and-frontpage') {
    try {
      const { website_id } = body;
      
      if (!website_id) {
        return J(400, { error: 'Missing website_id' });
      }

      // Get pages
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`, {
        method: 'GET',
        timeoutMs: 30000
      });

      if (!pages?.data?.length) {
        return J(400, { error: 'No pages found to publish' });
      }

      const pageIds = pages.data.map((p: any) => p.id);

      // Publish all pages
      await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
        method: 'POST',
        body: JSON.stringify({ action: 'publish', page_ids: pageIds }),
        timeoutMs: 60000
      });

      // Set Home page as front page
      const homePage = pages.data.find((p: any) => 
        p.title?.toLowerCase().includes('home') || 
        p.slug === 'home' || 
        p.is_front_page
      ) || pages.data[0];

      if (homePage) {
        await tw(`/v1/builder/websites/${website_id}/pages/front/set`, {
          method: 'POST',
          body: JSON.stringify({ page_id: homePage.id }),
          timeoutMs: 30000
        });
      }

      // Get domain info
      const domain = await tw(`/v1/hosting/websites/${website_id}/domain-name`, {
        method: 'GET',
        timeoutMs: 30000
      });

      const subdomain = domain?.data?.subdomain || 'unknown';
      const preview_url = `https://${subdomain}.10web.site`;
      const admin_url = `https://${subdomain}.10web.site/wp-admin`;

      return J(200, { 
        ok: true, 
        preview_url,
        admin_url 
      });
      
    } catch (error: any) {
      console.error('Publish and frontpage error:', error);
      return J(502, { 
        code: 'PUBLISH_AND_FRONTPAGE_FAILED', 
        detail: error?.json ?? error?.message ?? error 
      });
    }
  }

  return J(404, { 
    error: 'NOT_FOUND', 
    hint: 'use action=health or POST create-website, generate-sitemap, update-design, generate-from-sitemap, publish-and-frontpage' 
  });
});