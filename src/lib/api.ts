// src/lib/api.ts
const BASE = "https://eilpazegjrcrwgpujqni.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4";
const FN = `${BASE}/functions/v1/ai-router`;

const HEADERS: Record<string, string> = {
  accept: "application/json",
  "content-type": "application/json",
  apikey: ANON,
  Authorization: `Bearer ${ANON}`,
};

// Build 10Web-compliant parameters
const buildParams = (input: any) => {
  const allowed = new Set(['informational','ecommerce','agency','restaurant','service','portfolio','blog','saas']);
  const business_type = input.business_type || (input.website_type === 'ecommerce' ? 'ecommerce' : 'informational');
  const normalized_type = allowed.has(business_type) ? business_type : 'informational';
  
  return {
    business_name: input.business_name || input.seo_title || 'Business',
    business_description: input.business_description || input.seo_description || 'Description',
    business_type: normalized_type,
    website_title: input.seo_title || input.business_name || 'Website',
    website_description: input.seo_description || input.business_description || 'Description',
    website_keyphrase: input.seo_keyphrase || input.business_name || 'Website',
    website_type: input.website_type === 'ecommerce' ? 'ecommerce' : 'basic',
    pages_meta: Array.isArray(input.pages_meta) && input.pages_meta.length
      ? input.pages_meta
      : [
          { title: 'Home', sections: [{ section_title: 'Hero' }] },
          { title: 'Contact', sections: [{ section_title: 'Get In Touch' }] },
        ],
    ...(input.colors ? { colors: input.colors } : {}),
    fonts: { primary_font: input.fonts?.primary_font || input.fonts?.body || 'Inter' },
  };
};

async function req(action: string, payload: Record<string, any>, timeout = 65_000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(FN + `?action=${encodeURIComponent(action)}`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ action, ...payload }),
      signal: ctl.signal,
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err: any = new Error(json?.code || res.statusText || "Request failed");
      err.status = res.status; err.code = json?.code; err.detail = json; throw err;
    }
    return json;
  } catch (e: any) {
    if (e.name === "AbortError") { const x: any = new Error("CLIENT_TIMEOUT"); x.code = "CLIENT_TIMEOUT"; x.status = 408; throw x; }
    throw e;
  } finally { clearTimeout(t); }
}

export const api = {
  createWebsite: (businessName: string) =>
    req("create-website", { businessName }, 90_000),

  generateSitemap: (website_id: number, params: { business_name: string; business_description: string; business_type?: string }) =>
    req("generate-sitemap", { website_id, params }, 120_000),

  updateDesign: (siteId: number, design: any) =>
    req("update-design", { siteId, design }, 30_000),

  generateFromWithPolling: async (website_id: number, unique_id: string, onboardingData: any) => {
    const params = buildParams(onboardingData);
    const maxAttempts = 30;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await req("generate-from-sitemap", { website_id, unique_id, params }, 65_000);
        if (res?.ok && res?.pages_count > 0) return res;
        await new Promise(r => setTimeout(r, 3000));
      } catch (e: any) {
        if (e.code === "CLIENT_TIMEOUT") { 
          await new Promise(r => setTimeout(r, 3000)); 
          continue; 
        }
        throw e;
      }
    }
    throw new Error("Generation timeout after polling");
  },

  publishAndFrontWithPolling: async (website_id: number) => {
    const maxAttempts = 6;
    for (let i = 0; i < maxAttempts; i++) {
      try { 
        return await req("publish-and-frontpage", { website_id }, 180_000); 
      } catch (e: any) {
        if (e.code === "CLIENT_TIMEOUT" && i < maxAttempts - 1) { 
          await new Promise(r => setTimeout(r, 5000)); 
          continue; 
        }
        throw e;
      }
    }
    throw new Error("Publishing timeout");
  },
};

// named re-exports for existing imports
export const createWebsite = api.createWebsite;
export const generateSitemap = api.generateSitemap;
export const updateDesign = api.updateDesign;