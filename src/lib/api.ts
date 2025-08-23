// src/lib/api.ts
const BASE = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const FN = `${BASE}/functions/v1/ai-router`;

const HEADERS: Record<string, string> = {
  accept: 'application/json',
  'content-type': 'application/json',
  apikey: ANON,
  Authorization: `Bearer ${ANON}`,
};

type PagesMeta = { title: string; sections: { section_title: string }[] }[];

function minimalPagesMeta(pages_meta: any): PagesMeta {
  if (!Array.isArray(pages_meta) || pages_meta.length === 0) {
    return [
      { title: 'Home', sections: [{ section_title: 'Hero' }] },
      { title: 'Contact', sections: [{ section_title: 'Get In Touch' }] },
    ];
  }
  return pages_meta.map((p: any) => ({
    title: String(p?.title || 'Page'),
    sections:
      Array.isArray(p?.sections) && p.sections.length
        ? p.sections.map((s: any) => ({ section_title: String(s?.section_title || s?.title || 'Section') }))
        : [{ section_title: 'Section' }],
  }));
}

function normalizeGenerateParams(raw: any) {
  const p = JSON.parse(JSON.stringify(raw || {}));

  // coerce business_type
  const allowed = new Set([
    'informational', 'ecommerce', 'agency', 'restaurant', 'service', 'portfolio', 'blog', 'saas',
  ]);
  const btRaw = p.business_type || (p.website_type === 'ecommerce' ? 'ecommerce' : undefined);
  const business_type = allowed.has(String(btRaw)) ? btRaw : 'informational';

  const business_name = p.business_name || p.website_title || 'Business';
  const business_description = p.business_description || p.website_description || 'Generated with Naveeg.';

  const website_title = p.website_title || p.seo?.website_title || business_name;
  const website_description = p.website_description || p.seo?.website_description || business_description;
  const website_keyphrase = p.website_keyphrase || p.seo?.website_keyphrase || website_title;

  const website_type = p.website_type === 'ecommerce' ? 'ecommerce' : 'basic';
  const pages_meta = minimalPagesMeta(p.pages_meta);

  const colors = p.colors && typeof p.colors === 'object' ? p.colors : undefined;
  const fonts =
    p.fonts && typeof p.fonts === 'object' && p.fonts.primary_font
      ? p.fonts
      : { primary_font: 'Inter' };

  return {
    business_name,
    business_description,
    business_type,          // valid 10Web type
    website_title,
    website_description,
    website_keyphrase,
    website_type,           // 'basic' | 'ecommerce'
    pages_meta,
    ...(colors ? { colors } : {}),
    ...(fonts ? { fonts } : {}),
  };
}

async function req(
  action: string,
  payload: Record<string, any> = {},
  timeout = 120_000,
  method: 'GET' | 'POST' = 'POST'
) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const url = method === 'GET' ? `${FN}?action=${encodeURIComponent(action)}` : FN;
    const body =
      method === 'GET'
        ? undefined
        : JSON.stringify(
            action === 'generate-from-sitemap' && payload?.params
              ? { action, ...payload, params: normalizeGenerateParams(payload.params) }
              : { action, ...payload }
          );

    const res = await fetch(url, {
      method,
      mode: 'cors',
      credentials: 'omit',
      headers: HEADERS,
      body,
      signal: ctl.signal,
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const err: any = new Error(json?.code || res.statusText || 'Request failed');
      err.status = res.status;
      err.code = json?.code;
      err.detail = json;
      throw err;
    }
    return json;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const timeoutErr: any = new Error('CLIENT_TIMEOUT');
      timeoutErr.code = 'CLIENT_TIMEOUT';
      timeoutErr.status = 408;
      timeoutErr.originalError = error;
      throw timeoutErr;
    }
    throw error;
  } finally {
    clearTimeout(t);
  }
}

export const api = {
  health: () => req('health', {}, 30_000, 'GET'),

  createWebsite: (businessName: string) =>
    req('create-website', { businessName }, 90_000),

  generateSitemap: (website_id: number, params: any) =>
    req('generate-sitemap', { website_id, params }, 180_000),

  updateDesign: (siteId: number, design: any) =>
    req('update-design', { siteId, design }, 30_000),

  generateFrom: (website_id: number, unique_id: string, params: any) =>
    req('generate-from-sitemap', { website_id, unique_id, params }, 240_000),

  publishAndFront: (website_id: number) =>
    req('publish-and-frontpage', { website_id }, 180_000),

  generateFromWithPolling: async (website_id: number, unique_id: string, params: any) => {
    const maxAttempts = 8;
    const attemptTimeout = 240_000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await req('generate-from-sitemap', { website_id, unique_id, params }, attemptTimeout);
      } catch (error: any) {
        if (error.code === 'CLIENT_TIMEOUT' && attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Generation timeout after maximum attempts');
  },

  publishAndFrontWithPolling: async (website_id: number) => {
    const maxAttempts = 6;
    const attemptTimeout = 180_000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await req('publish-and-frontpage', { website_id }, attemptTimeout);
      } catch (error: any) {
        if (error.code === 'CLIENT_TIMEOUT' && attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Publishing timeout after maximum attempts');
  },
};

// Legacy named exports
export const createWebsite = api.createWebsite;
export const generateSitemap = api.generateSitemap;
export const generateFromSitemap = (websiteId: number, uniqueId: string, params: any) =>
  api.generateFrom(websiteId, uniqueId, params);
export const publishAndFrontpage = api.publishAndFront;
export const updateDesign = api.updateDesign;