// src/lib/api.ts

const BASE = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const FN = `${BASE}/functions/v1/ai-router`;

const HEADERS: Record<string, string> = {
  "content-type": "application/json",
  accept: "application/json",
  apikey: ANON,
  Authorization: `Bearer ${ANON}`,
};

type HttpMethod = "GET" | "POST";

function hexOk(v?: string) {
  return typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
}

function sanitizeColors(c?: any) {
  if (!c || typeof c !== "object") return undefined;
  const out: any = {};
  if (hexOk(c.primary_color)) out.primary_color = c.primary_color;
  if (hexOk(c.secondary_color)) out.secondary_color = c.secondary_color;
  if (hexOk(c.background_dark)) out.background_dark = c.background_dark;
  return Object.keys(out).length ? out : undefined;
}

function sanitizeFonts(f?: any) {
  if (!f || typeof f !== "object") return undefined;
  const name = f.primary_font || f.heading || f.body;
  return typeof name === "string" ? { primary_font: name } : undefined;
}

function sanitizeGenerateParams(p: any) {
  const src = { ...(p || {}) };

  // enforce fonts schema
  const fonts = sanitizeFonts(src.fonts);
  if (fonts) src.fonts = fonts; else delete src.fonts;

  // enforce colors schema
  const colors = sanitizeColors(src.colors);
  if (colors) src.colors = colors; else delete src.colors;

  // align website_type with business_type
  src.website_type = src.business_type === "ecommerce" ? "ecommerce" : "basic";

  // whitelist only allowed fields
  const out: any = {
    business_name: String(src.business_name || ""),
    business_description: String(src.business_description || ""),
    business_type: String(src.business_type || "informational"),
    website_title: String(src.website_title || src.seo?.website_title || src.business_name || "Website"),
    website_description: String(src.website_description || src.seo?.website_description || src.business_description || ""),
    website_keyphrase: String(src.website_keyphrase || src.seo?.website_keyphrase || src.website_title || ""),
    website_type: src.website_type,
    pages_meta: Array.isArray(src.pages_meta) ? src.pages_meta : [],
  };
  if (colors) out.colors = colors;
  if (fonts) out.fonts = fonts;
  return out;
}

async function req(
  action: string,
  payload: Record<string, any> = {},
  timeout = 120_000,
  method: HttpMethod = "POST"
) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);

  try {
    const url = method === "GET" ? `${FN}?action=${encodeURIComponent(action)}` : FN;

    const res = await fetch(url, {
      method,
      mode: "cors",
      credentials: "omit",
      headers: HEADERS,
      body: method === "GET" ? undefined : JSON.stringify({ action, ...payload }),
      signal: ctl.signal,
    });

    const text = await res.text();
    const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : null;

    if (!res.ok) {
      const err: any = new Error(json?.code || res.statusText || "Request failed");
      err.status = res.status;
      err.code = json?.code || json?.error || undefined;
      err.detail = json || undefined;
      throw err;
    }
    return json;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      const e: any = new Error("CLIENT_TIMEOUT");
      e.code = "CLIENT_TIMEOUT"; e.status = 408; e.originalError = error;
      throw e;
    }
    const msg = String(error?.message || "");
    if (!error?.status && (error?.name === "TypeError" || /NetworkError|Failed to fetch|Load failed/i.test(msg))) {
      const e: any = new Error("TRANSIENT_NETWORK_ERROR");
      e.code = "TRANSIENT_NETWORK_ERROR"; e.status = 503; e.originalError = error;
      throw e;
    }
    throw error;
  } finally { clearTimeout(t); }
}

function shouldRetry(err: any) {
  const code = err?.code, status = err?.status;
  return code === "CLIENT_TIMEOUT" || code === "GENERATE_TIMEOUT" || code === "PUBLISH_RETRY" ||
         code === "TRANSIENT_NETWORK_ERROR" || status === 504 || status === 503;
}

async function backoffWait(attempt: number, baseMs = 2000, maxMs = 10_000) {
  const ms = Math.min(Math.round(baseMs * Math.pow(1.5, attempt - 1)), maxMs);
  await new Promise(r => setTimeout(r, ms));
}

export const api = {
  health: () => req("health", {}, 30_000, "GET"),

  createWebsite: (businessName: string) =>
    req("create-website", { businessName }, 120_000),

  generateSitemap: (website_id: number, params: any) =>
    req("generate-sitemap", { website_id, params }, 180_000),

  updateDesign: (siteId: number, design: any) =>
    req("update-design", { siteId, design }, 45_000),

  generateFrom: (website_id: number, unique_id: string, params: any) =>
    req("generate-from-sitemap", { website_id, unique_id, params: sanitizeGenerateParams(params) }, 240_000),

  publishAndFront: (website_id: number) =>
    req("publish-and-frontpage", { website_id }, 180_000),

  generateFromWithPolling: async (website_id: number, unique_id: string, params: any) => {
    const maxAttempts = 10; const attemptTimeout = 240_000;
    const clean = sanitizeGenerateParams(params);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try { return await req("generate-from-sitemap", { website_id, unique_id, params: clean }, attemptTimeout); }
      catch (error: any) {
        if (attempt < maxAttempts && shouldRetry(error)) { await backoffWait(attempt, 3000, 12_000); continue; }
        throw error;
      }
    }
    throw new Error("Generation timeout after maximum attempts");
  },

  publishAndFrontWithPolling: async (website_id: number) => {
    const maxAttempts = 8; const attemptTimeout = 180_000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try { return await req("publish-and-frontpage", { website_id }, attemptTimeout); }
      catch (error: any) {
        if (attempt < maxAttempts && shouldRetry(error)) { await backoffWait(attempt, 3000, 12_000); continue; }
        throw error;
      }
    }
    throw new Error("Publishing timeout after maximum attempts");
  },
};

// Legacy exports
export const createWebsite = api.createWebsite;
export const generateSitemap = api.generateSitemap;
export const generateFromSitemap = (websiteId: number, uniqueId: string, params: any) =>
  api.generateFrom(websiteId, uniqueId, params);
export const publishAndFrontpage = api.publishAndFront;
export const updateDesign = api.updateDesign;
