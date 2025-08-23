// supabase/functions/ai-router/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// ---- env
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const API_BASE = Deno.env.get("TENWEB_API_BASE") || "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY") || "";

// ---- clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---- CORS
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && (
      /^http:\/\/localhost(:\d+)?$/i.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin) ||
      /^https:\/\/.*\.lovable\.app$/i.test(origin) ||
      /^https:\/\/.*\.naveeg\.com$/i.test(origin)
    ) ? origin : "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, apikey, x-api-key, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});
const J = (code: number, data: unknown, origin: string | null) =>
  new Response(JSON.stringify(data), { status: code, headers: { "content-type": "application/json", ...corsHeaders(origin) } });

// ---- 10Web fetch
type TwInit = RequestInit & { timeoutMs?: number };
const tw = async (path: string, init: TwInit = {}) => {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 90_000);
  try {
    const bodyStr = typeof init.body === "string" ? init.body : undefined;
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Supabase-Edge-Function/1.0",
      "x-api-key": API_KEY,
      ...(init.headers as Record<string, string> | undefined),
    };
    if (init.method === "POST" && bodyStr) headers["Content-Length"] = String(new TextEncoder().encode(bodyStr).length);

    const hit = async () => {
      const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctl.signal, headers });
      const txt = await res.text();
      let json: any = null;
      try { json = txt ? JSON.parse(txt) : null; } catch {}
      if (!res.ok) throw { status: res.status, json, raw: txt };
      return json ?? {};
    };

    try { return await hit(); }
    catch (e: any) {
      if (e?.status === 429 || e?.status >= 500) {
        await new Promise(r => setTimeout(r, 1500));
        return await hit();
      }
      throw e;
    }
  } finally { clearTimeout(id); }
};

// ---- utils
const slugify = (t?: string) =>
  (t || "site").toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 45) || "site";

const subCandidate = (base: string, salt: string) =>
  (base + "-" + salt).toLowerCase().replace(/[^a-z0-9-]+/g, "").slice(0, 45);

const listSites = async () => {
  try { return await tw("/v1/account/websites", { method: "GET", timeoutMs: 30_000 }); }
  catch { return { data: [] }; }
};
const findBySub = async (sub: string) => {
  const s = await listSites();
  return s.data?.find((w: any) => w?.site_url?.includes(`${sub}.`) || w?.admin_url?.includes(`${sub}.`));
};
const ensureFreeSub = async (base: string) => {
  try {
    await tw("/v1/hosting/websites/subdomain/check", { method: "POST", body: JSON.stringify({ subdomain: base }), timeoutMs: 10_000 });
    return base;
  } catch {}
  for (let i = 0; i < 18; i++) {
    const sub = subCandidate(base, Math.random().toString(36).slice(2, 8));
    try {
      await tw("/v1/hosting/websites/subdomain/check", { method: "POST", body: JSON.stringify({ subdomain: sub }), timeoutMs: 10_000 });
      return sub;
    } catch {}
  }
  return subCandidate(base, Date.now().toString(36));
};

const minimalPagesMeta = (pages_meta: any): { title: string; sections: { section_title: string }[] }[] => {
  if (!Array.isArray(pages_meta) || pages_meta.length === 0) {
    return [
      { title: "Home",    sections: [{ section_title: "Hero" }, { section_title: "About Us" }] },
      { title: "Contact", sections: [{ section_title: "Get In Touch" }] },
    ];
  }
  return pages_meta.map((p: any) => ({
    title: String(p?.title || "Page"),
    sections: Array.isArray(p?.sections) && p.sections.length
      ? p.sections.map((s: any) => ({ section_title: String(s?.section_title || s?.title || "Section") }))
      : [{ section_title: "Section" }],
  }));
};

// ---- coercers: strip unsupported keys and conform types
const coerceColors = (c: any | undefined) => {
  if (!c || typeof c !== "object") return undefined;
  const out: any = {};
  const hex = /^#[0-9a-f]{6}$/i;
  if (c.primary_color && hex.test(c.primary_color)) out.primary_color = c.primary_color;
  if (c.secondary_color && hex.test(c.secondary_color)) out.secondary_color = c.secondary_color;
  if (c.background_dark && hex.test(c.background_dark)) out.background_dark = c.background_dark;
  return Object.keys(out).length ? out : undefined;
};

const coerceFonts = (f: any, root?: any) => {
  // Accept only { primary_font: string }
  const pick =
    f?.primary_font ||
    f?.heading ||
    f?.body ||
    root?.primary_font ||
    root?.heading ||
    root?.body;
  const name = typeof pick === "string" ? pick : undefined;
  return name ? { primary_font: name } : undefined;
};

const normalizeSitemapParams = (raw: any) => {
  const p = { ...(raw || {}) };

  const business_name = String(p.business_name || p.businessName || p.site_title || p.brand || "Business");
  const business_description = String(p.business_description || p.businessDescription || p.description || "");
  const business_type = String(p.business_type || p.businessType || "informational");

  const colors = coerceColors(p.colors || p.style?.colors);
  const fonts  = coerceFonts(p.fonts || p.style?.fonts, p);

  return {
    business_name,
    business_description,
    business_type,
    ...(colors ? { colors } : {}),
    ...(fonts  ? { fonts }  : {}),
    // optional hints kept but not forwarded if undefined
    ...(p.locale ? { locale: p.locale } : {}),
    ...(p.tone ? { tone: p.tone } : {}),
    ...(p.niche || p.category ? { niche: p.niche || p.category } : {}),
  };
};

const normalizeGenerationParams = (raw: any, carry: any = {}) => {
  const p = { ...(raw || {}) };

  const business_name = String(p.business_name || carry.business_name || carry.site_title || "Business");
  const business_description = String(p.business_description || carry.business_description || "");
  const business_type = String(p.business_type || carry.business_type || "informational");

  const website_title = String(p.website_title || p.seo?.website_title || business_name);
  const website_description = String(p.website_description || p.seo?.website_description || business_description);
  const website_keyphrase = String(p.website_keyphrase || p.seo?.website_keyphrase || website_title);

  // website_type must align with business_type
  const website_type = business_type === "ecommerce" ? "ecommerce" : "basic";

  const pages_meta = minimalPagesMeta(p.pages_meta);

  const colors = coerceColors(p.colors);
  const fonts  = coerceFonts(p.fonts, p);

  // whitelist only allowed keys
  return {
    business_name,
    business_description,
    business_type,
    website_title,
    website_description,
    website_keyphrase,
    website_type,
    pages_meta,
    ...(colors ? { colors } : {}),
    ...(fonts  ? { fonts }  : {}),
  };
};

// ---- handlers
const handleCreateWebsite = async (body: any, origin: string | null) => {
  const businessName = (body.businessName || body.business_name || "New Site").toString().trim();
  const base = slugify(businessName);
  const existing = await findBySub(base);
  if (existing) return J(200, { ok: true, website_id: existing.id, subdomain: base, reused: true }, origin);

  let candidate = await ensureFreeSub(base);
  const payload = (sub: string, region: string) => ({
    subdomain: sub,
    region,
    site_title: businessName,
    admin_username: "admin",
    admin_password: crypto.randomUUID().replace(/-/g, "").slice(0, 16) + "Aa1!",
  });

  for (let i = 0; i < 12; i++) {
    try {
      try {
        const r = await tw("/v1/hosting/website", { method: "POST", body: JSON.stringify(payload(candidate, "europe-west3-b")), timeoutMs: 25_000 });
        const d = r?.data ?? r;
        return J(200, { ok: true, website_id: d?.website_id, subdomain: candidate, reused: false }, origin);
      } catch (e: any) {
        if (e?.status === 400 || e?.status === 422) {
          const r2 = await tw("/v1/hosting/website", { method: "POST", body: JSON.stringify(payload(candidate, "europe-west3")), timeoutMs: 25_000 });
          const d2 = r2?.data ?? r2;
          return J(200, { ok: true, website_id: d2?.website_id, subdomain: candidate, reused: false }, origin);
        }
        throw e;
      }
    } catch (e: any) {
      const msg = JSON.stringify(e?.json || e?.raw || e?.message || "");
      if (e?.status === 409 || /subdomain.*use/i.test(msg)) { candidate = subCandidate(base, Math.random().toString(36).slice(2, 8)); continue; }
      if (e?.name === "AbortError") {
        for (let p = 0; p < 20; p++) {
          await new Promise(r => setTimeout(r, 2000));
          const polled = await findBySub(candidate);
          if (polled) return J(200, { ok: true, website_id: polled.id, subdomain: candidate, reused: false }, origin);
        }
      }
      throw e;
    }
  }
  return J(409, { code: "SUBDOMAIN_EXHAUSTED" }, origin);
};

const handleGenerateSitemap = async (body: any, origin: string | null) => {
  const { website_id } = body || {};
  let { params } = body || {};
  if (!website_id || !params) return J(400, { error: "Missing website_id or params" }, origin);

  params = normalizeSitemapParams(params);
  if (!params.business_name || !params.business_description) {
    return J(400, { error: "Missing required params: business_name, business_description" }, origin);
  }
  if (!params.business_type) params.business_type = "informational";

  const res = await tw("/v1/ai/generate_sitemap", {
    method: "POST",
    body: JSON.stringify({ website_id, params }),
    timeoutMs: 120_000,
  });

  const data = res?.data ?? res;

  const pages_meta = minimalPagesMeta(data?.pages_meta);
  const seo = {
    website_title: data?.website_title || data?.seo?.website_title || params.business_name,
    website_description: data?.website_description || data?.seo?.website_description || params.business_description,
    website_keyphrase: data?.website_keyphrase || data?.seo?.website_keyphrase || params.business_name,
  };
  const colors = coerceColors(data?.colors) || {
    primary_color: "#FF7A00",
    secondary_color: "#1E62FF",
    background_dark: "#121212",
  };
  const fonts = coerceFonts(data?.fonts) || { primary_font: "Inter" };

  return J(200, {
    unique_id: data?.unique_id || data?.sitemap_unique_id || crypto.randomUUID(),
    pages_meta,
    seo,
    colors,
    fonts,
    website_type: params.business_type === "ecommerce" ? "ecommerce" : "basic",
  }, origin);
};

const handleUpdateDesign = async (body: any, origin: string | null) => {
  const { siteId, design } = body || {};
  if (!siteId || !design) return J(400, { error: "Missing siteId or design" }, origin);

  const colors = coerceColors(design.colors);
  const fonts  = coerceFonts(design.fonts, design);

  const { error } = await supabase.from("sites").update({
    colors,
    fonts,
    pages_meta: minimalPagesMeta(design.pages_meta),
    seo_title: design.seo?.title || design.seo?.website_title,
    seo_description: design.seo?.description || design.seo?.website_description,
    seo_keyphrase: design.seo?.keyphrase || design.seo?.website_keyphrase,
    website_type: design.business_type === "ecommerce" ? "ecommerce" : "basic",
    updated_at: new Date().toISOString(),
  }).eq("website_id", siteId);

  if (error) return J(500, { error: "Failed to update design", detail: error.message }, origin);
  return J(200, { ok: true }, origin);
};

const handleGenerateFromSitemap = async (body: any, origin: string | null) => {
  const { website_id } = body || {};
  const unique_id = body?.unique_id || body?.sitemap_unique_id;
  let params = body?.params;
  if (!website_id || !unique_id || !params) return J(400, { error: "Missing website_id, unique_id, or params" }, origin);

  const norm = normalizeGenerationParams(params, {
    business_name: body?.business_name,
    business_description: body?.business_description,
    business_type: body?.business_type,
  });

  // final strict whitelist
  params = {
    business_name: norm.business_name,
    business_description: norm.business_description,
    business_type: norm.business_type,
    website_title: norm.website_title,
    website_description: norm.website_description,
    website_keyphrase: norm.website_keyphrase,
    website_type: norm.website_type,
    pages_meta: norm.pages_meta,
    ...(norm.colors ? { colors: norm.colors } : {}),
    ...(norm.fonts  ? { fonts:  norm.fonts  } : {}),
  };

  const required = ["business_name","business_description","business_type","website_title","website_description","website_keyphrase","pages_meta"];
  const missing = required.filter((k) => !(k in params) || (k === "pages_meta" ? !Array.isArray((params as any)[k]) || !(params as any)[k].length : !(params as any)[k]));
  if (missing.length) return J(422, { code: "MISSING_REQUIRED_PARAMS", missing }, origin);

  try {
    await tw("/v1/ai/generate_site_from_sitemap", {
      method: "POST",
      body: JSON.stringify({ website_id, unique_id, params }),
      timeoutMs: 120_000,
    });
  } catch (e: any) {
    if (e?.status === 422) {
      return J(422, { code: "VALIDATION_ERROR", detail: e?.json ?? e?.raw ?? "Unprocessable Content" }, origin);
    }
    const msg = JSON.stringify(e?.json || e?.raw || e?.message || "");
    if (e?.status === 417 || e?.status === 504 || e?.name === "AbortError" || /in progress/i.test(msg)) {
      // continue to polling
    } else {
      return J(502, { code: "GENERATE_FAILED", detail: e?.json || e?.message || String(e) }, origin);
    }
  }

  // short server-side poll; client keeps polling
  const deadline = Date.now() + 90_000;
  let interval = 3000;
  let polls = 0;
  while (Date.now() < deadline) {
    try {
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
      const list = Array.isArray(pages?.data) ? pages.data : [];
      if (list.length > 0) return J(200, { ok: true, pages_count: list.length }, origin);
    } catch {}
    await new Promise(r => setTimeout(r, interval));
    interval = Math.min(Math.round(interval * 1.5), 10_000);
    polls++;
  }
  return J(504, { code: "GENERATE_TIMEOUT", hint: "Still processing. Continue polling client-side.", polls_completed: polls }, origin);
};

const handlePublishAndFrontpage = async (body: any, origin: string | null) => {
  const { website_id } = body || {};
  if (!website_id) return J(400, { error: "Missing website_id" }, origin);

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
      const list: any[] = Array.isArray(pages?.data) ? pages.data : [];
      if (list.length === 0) { await new Promise(r => setTimeout(r, 3000)); continue; }

      try {
        await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
          method: "POST",
          body: JSON.stringify({ page_ids: list.map((p: any) => p.id) }),
          timeoutMs: 60_000,
        });
      } catch (e: any) {
        if (![400,409,422].includes(e?.status ?? 0)) {
          await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
            method: "POST",
            body: JSON.stringify({ action: "publish", page_ids: list.map((p: any) => p.id) }),
            timeoutMs: 60_000,
          });
        }
      }

      const home = list.find((p: any) => /home|accueil/i.test(p?.title) || p?.slug === "home" || p?.is_front_page) ?? list[0];
      if (home) {
        try {
          await tw(`/v1/builder/websites/${website_id}/pages/front/set`, { method: "POST", body: JSON.stringify({ page_id: home.id }), timeoutMs: 30_000 });
        } catch (e: any) { if (![400,409,422].includes(e?.status ?? 0)) throw e; }
      }

      let preview_url: string | null = null;
      let admin_url: string | null = null;
      try {
        const dn = await tw(`/v1/hosting/websites/${website_id}/domain-name`, { method: "GET", timeoutMs: 30_000 });
        const d = dn?.data ?? dn;
        if (Array.isArray(d)) {
          const first = d[0] || {};
          preview_url = first?.default_domain_url || first?.site_url || null;
          admin_url = first?.admin_url || null;
        } else if (d && typeof d === "object") {
          preview_url = d?.default_domain_url || d?.site_url || null;
          admin_url = d?.admin_url || null;
        }
      } catch {}
      if (!preview_url || !admin_url) {
        const acc = await listSites();
        const hit = acc?.data?.find?.((w: any) => w?.id === website_id);
        const sub = hit?.subdomain;
        preview_url = preview_url || hit?.site_url || (sub ? `https://${sub}.10web.site` : null);
        admin_url = admin_url || hit?.admin_url || (sub ? `https://${sub}.10web.site/wp-admin` : null);
      }
      if (preview_url && admin_url) return J(200, { ok: true, preview_url, admin_url }, origin);
    } catch {}
    await new Promise(r => setTimeout(r, 3000));
  }
  return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing. Continue polling client-side." }, origin);
};

// ---- server
serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });

  try {
    const url = new URL(req.url);
    let body: any = {};
    if (req.method === "POST") { try { body = await req.json(); } catch { body = {}; } }

    let action = (url.searchParams.get("action") || body?.action || url.pathname.split("/").pop() || "")
      .toString().trim().toLowerCase();
    const aliases: Record<string, string> = {
      generate: "generate-from-sitemap",
      publish: "publish-and-frontpage",
      sitemap: "generate-sitemap",
      update: "update-design",
      health: "health",
    };
    action = aliases[action] || action;

    if (req.method === "GET" && action === "health") {
      return J(200, {
        status: "healthy",
        timestamp: new Date().toISOString(),
        available_actions: ["create-website","generate-sitemap","generate-from-sitemap","publish-and-frontpage","update-design"],
      }, origin);
    }
    if (req.method === "POST" && !action) return J(400, { code: "MISSING_ACTION" }, origin);

    if (req.method === "POST" && action === "create-website")        return await handleCreateWebsite(body, origin);
    if (req.method === "POST" && action === "generate-sitemap")      return await handleGenerateSitemap(body, origin);
    if (req.method === "POST" && action === "generate-from-sitemap") return await handleGenerateFromSitemap(body, origin);
    if (req.method === "POST" && action === "publish-and-frontpage") return await handlePublishAndFrontpage(body, origin);
    if (req.method === "POST" && action === "update-design")         return await handleUpdateDesign(body, origin);

    return J(404, { error: "NOT_FOUND", hint: "Use GET ?action=health or POST one of the listed actions" }, origin);
  } catch (err: any) {
    console.error("UNHANDLED_ERROR", err);
    return new Response(JSON.stringify({ code: "UNHANDLED", message: String(err) }), {
      status: 500, headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("origin")) },
    });
  }
});