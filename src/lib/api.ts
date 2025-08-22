// src/lib/api.ts

const BASE = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const FN = `${BASE}/functions/v1/ai-router`;

const HEADERS: Record<string, string> = {
  'content-type': 'application/json',
  'accept': 'application/json',
  'apikey': ANON,
  'Authorization': `Bearer ${ANON}`,
};

async function req(
  action: string,
  payload: Record<string, any> = {},
  timeout = 120_000,
  method: 'GET' | 'POST' = 'POST'
) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);

  try {
    const url = method === 'GET'
      ? `${FN}?action=${encodeURIComponent(action)}`
      : FN;

    const res = await fetch(url, {
      method,
      mode: 'cors',
      credentials: 'omit',
      headers: HEADERS,
      body: method === 'GET' ? undefined : JSON.stringify({ action, ...payload }),
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
    // Normalize AbortError to CLIENT_TIMEOUT for consistent handling
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
    req('generate-from-sitemap', { website_id, unique_id, params }, 240_000), // Increased timeout

  publishAndFront: (website_id: number) =>
    req('publish-and-frontpage', { website_id }, 180_000), // Increased timeout

  // Polling version that treats CLIENT_TIMEOUT as "still processing"
  generateFromWithPolling: async (website_id: number, unique_id: string, params: any) => {
    const maxAttempts = 8; // ~16 minutes total (4min per attempt)
    const attemptTimeout = 240_000; // 4 minutes per attempt
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await req('generate-from-sitemap', { website_id, unique_id, params }, attemptTimeout);
      } catch (error: any) {
        if (error.code === 'CLIENT_TIMEOUT' && attempt < maxAttempts) {
          // Client timeout means generation is still in progress, wait and retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Generation timeout after maximum attempts');
  },

  publishAndFrontWithPolling: async (website_id: number) => {
    const maxAttempts = 6; // ~18 minutes total (3min per attempt)
    const attemptTimeout = 180_000; // 3 minutes per attempt
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await req('publish-and-frontpage', { website_id }, attemptTimeout);
      } catch (error: any) {
        if (error.code === 'CLIENT_TIMEOUT' && attempt < maxAttempts) {
          // Client timeout means publishing is still in progress, wait and retry
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Publishing timeout after maximum attempts');
  }
};

// Legacy named exports (keep existing imports working)
export const createWebsite = api.createWebsite;
export const generateSitemap = api.generateSitemap;
export const generateFromSitemap = (websiteId: number, uniqueId: string, params: any) =>
  api.generateFrom(websiteId, uniqueId, params);
export const publishAndFrontpage = api.publishAndFront;
export const updateDesign = api.updateDesign;