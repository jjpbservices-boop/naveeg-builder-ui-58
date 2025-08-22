// supabase/functions/ai-router/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const API_BASE = Deno.env.get("TENWEB_API_BASE") || "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY") || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---- CORS
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && (
      /^http:\/\/localhost(:\d+)?$/i.test(origin) ||
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

// ---- 10Web fetch helper
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
      try { json = txt ? JSON.parse(txt) : null; } catch { json = null; }
      if (!res.ok) throw { status: res.status, json, raw: txt };
      return json;
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
  } catch { /* in use */ }
  for (let i = 0; i < 18; i++) {
    const sub = subCandidate(base, Math.random().toString(36).slice(2, 8));
    try {
      await tw("/v1/hosting/websites/subdomain/check", { method: "POST", body: JSON.stringify({ subdomain: sub }), timeoutMs: 10_000 });
      return sub;
    } catch {}
  }
  return subCandidate(base, Date.now().toString(36));
};

// ---- schema normalizers (critical)
type SitemapParamsIn = any;
const minimalPagesMeta = (pages_meta: any): { title: string; sections: { section_title: string }[] }[] => {
  if (!Array.isArray(pages_meta) || pages_meta.length === 0) {
    return [
      { title: "Home", sections: [{ section_title: "Hero" }, { section_title: "About Us" }] },
      { title: "Contact", sections: [{ section_title: "Get In Touch" }] },
    ];
  }
  // keep only fields 10Web accepts
  return pages_meta.map((p: any) => ({
    title: String(p?.title || "Page"),
    sections: Array.isArray(p?.sections) && p.sections.length
      ? p.sections.map((s: any) => ({ section_title: String(s?.section_title || s?.title || "Section") }))
      : [{ section_title: "Section" }],
  }));
};

const normalizeSitemapParams = (raw: SitemapParamsIn) => {
  const p = { ...(raw || {}) };
  // accept alternate keys Lovable might send
  p.business_name = p.business_name || p.businessName || p.site_title || p.brand || "Business";
  p.business_description = p.business_description || p.businessDescription || p.description || "";
  p.business_type = p.business_type || p.businessType || "informational";
  if (p.style?.colors && !p.colors) p.colors = p.style.colors;
  if (p.style?.fonts && !p.fonts) p.fonts = p.style.fonts;
  // 10Web ignores unexpected keys; keep them minimal
  return {
    business_name: String(p.business_name),
    business_description: String(p.business_description),
    business_type: String(p.business_type),
    colors: p.colors || undefined,
    fonts: p.fonts || undefined,
    locale: p.locale || p.language || undefined,
    tone: p.tone || undefined,
    niche: p.niche || p.category || undefined,
  };
};

type GenParamsIn = any;
const normalizeGenerationParams = (raw: GenParamsIn) => {
  const p = { ...(raw || {}) };

  // allow both flattened and nested seo
  const seo = p.seo || {
    website_title: p.website_title || p.title || "Website",
    website_description: p.website_description || p.description || "",
    website_keyphrase: p.website_keyphrase || p.keyphrase || (p.website_title || "Website"),
  };

  const website_type = p.website_type || p.business_type || "basic";
  const pages_meta = minimalPagesMeta(p.pages_meta);

  return { seo, website_type, pages_meta };
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
    };
    action = aliases[action] || action;

    if (req.method === "GET" && action === "health") {
      return J(200, { status: "healthy", timestamp: new Date().toISOString(), available_actions: [
        "create-website","generate-sitemap","update-design","generate-from-sitemap","publish-and-frontpage",
      ] }, origin);
    }
    if (req.method === "POST" && !action) return J(400, { code: "MISSING_ACTION" }, origin);

    // ---- CREATE WEBSITE
    if (req.method === "POST" && action === "create-website") {
      try {
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
              return J(200, { ok: true, website_id: r?.data?.website_id, subdomain: candidate, reused: false }, origin);
            } catch (e: any) {
              if (e?.status === 400 || e?.status === 422) {
                const r2 = await tw("/v1/hosting/website", { method: "POST", body: JSON.stringify(payload(candidate, "europe-west3")), timeoutMs: 25_000 });
                return J(200, { ok: true, website_id: r2?.data?.website_id, subdomain: candidate, reused: false }, origin);
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
      } catch (error: any) {
        const status = error?.status || 502;
        return J(status, { code: "CREATE_FAILED", status, detail: error?.json || error?.message || String(error) }, origin);
      }
    }

    // ---- GENERATE SITEMAP
    if (req.method === "POST" && action === "generate-sitemap") {
      try {
        const { website_id } = body || {};
        let { params } = body || {};
        if (!website_id || !params) return J(400, { error: "Missing website_id or params" }, origin);

        params = normalizeSitemapParams(params);
        if (!params.business_name || !params.business_description) {
          return J(400, { error: "Missing required params: business_name, business_description" }, origin);
        }
        if (!params.business_type) params.business_type = "informational";

        const result = await tw("/v1/ai/generate_sitemap", {
          method: "POST",
          body: JSON.stringify({ website_id, params }),
          timeoutMs: 120_000,
        });

        const pages_meta = minimalPagesMeta(result?.pages_meta);
        const seo = {
          website_title: result?.seo?.website_title || params.business_name,
          website_description: result?.seo?.website_description || params.business_description,
          website_keyphrase: result?.seo?.website_keyphrase || params.business_name,
        };

        return J(200, {
          unique_id: result?.unique_id || result?.sitemap_unique_id || crypto.randomUUID(),
          pages_meta,
          seo,
          colors: result?.colors || undefined,
          fonts: result?.fonts || undefined,
          website_type: params.business_type === "ecommerce" ? "ecommerce" : "basic",
        }, origin);
      } catch (error: any) {
        return J(502, { code: "GENERATE_SITEMAP_FAILED", detail: error?.json || error?.message || String(error) }, origin);
      }
    }

    // ---- UPDATE DESIGN
    if (req.method === "POST" && action === "update-design") {
      try {
        const { siteId, design } = body || {};
        if (!siteId || !design) return J(400, { error: "Missing siteId or design" }, origin);

        const hex = /^#[0-9a-f]{6}$/i;
        const { colors } = design || {};
        if (colors) {
          const { primary_color, secondary_color, background_dark } = colors;
          if (primary_color && !hex.test(primary_color)) return J(400, { error: "Invalid primary_color format" }, origin);
          if (secondary_color && !hex.test(secondary_color)) return J(400, { error: "Invalid secondary_color format" }, origin);
          if (background_dark && !hex.test(background_dark)) return J(400, { error: "Invalid background_dark format" }, origin);
        }

        const { error } = await supabase.from("sites").update({
          colors: design.colors,
          fonts: design.fonts,
          pages_meta: design.pages_meta,
          seo_title: design.seo?.title || design.seo?.website_title,
          seo_description: design.seo?.description || design.seo?.website_description,
          seo_keyphrase: design.seo?.keyphrase || design.seo?.website_keyphrase,
          website_type: design.website_type,
          updated_at: new Date().toISOString(),
        }).eq("website_id", siteId);
        if (error) return J(500, { error: "Failed to update design" }, origin);

        return J(200, { ok: true }, origin);
      } catch (error: any) {
        return J(500, { code: "UPDATE_DESIGN_FAILED", detail: error?.message || String(error) }, origin);
      }
    }

    // ---- GENERATE FROM SITEMAP
    if (req.method === "POST" && action === "generate-from-sitemap") {
      try {
        const { website_id } = body || {};
        const unique_id = body?.unique_id || body?.sitemap_unique_id;
        let params = body?.params;
        if (!website_id || !unique_id || !params) return J(400, { error: "Missing website_id, unique_id, or params" }, origin);

        // normalize to 10Web expected shape
        const norm = normalizeGenerationParams(params);
        params = { pages_meta: norm.pages_meta, seo: norm.seo, website_type: norm.website_type };

        // hard validation
        if (!Array.isArray(params.pages_meta) || params.pages_meta.length === 0) {
          return J(400, { code: "MISSING_REQUIRED_PARAMS", error: "pages_meta is empty" }, origin);
        }
        if (!params.seo?.website_title || !params.seo?.website_description || !params.seo?.website_keyphrase) {
          return J(400, { code: "MISSING_REQUIRED_PARAMS", error: "seo.website_* fields are required" }, origin);
        }

        console.log("Starting generation with params:", JSON.stringify({ website_id, unique_id }, null, 2));

        try {
          await tw("/v1/ai/generate_site_from_sitemap", {
            method: "POST",
            body: JSON.stringify({ website_id, unique_id, params }),
            timeoutMs: 120_000,
          });
        } catch (e: any) {
          const msg = JSON.stringify(e?.json || e?.raw || e?.message || "");
          console.log("Generation API error:", { status: e?.status, error: e?.json, raw: e?.raw });
          if (e?.status === 422 && e?.json?.error?.details) {
            return J(422, { code: "VALIDATION_ERROR", details: e.json.error.details, hint: "Fix params schema" }, origin);
          }
          // many backends return 417/504 while job is queued; fall through to poll
          if (e?.status === 417 || e?.status === 504 || e?.name === "AbortError" || /in progress/i.test(msg)) {
            // proceed to poll
          } else {
            return J(502, { code: "GENERATE_FAILED", detail: e?.json || e?.message || String(e) }, origin);
          }
        }

        // Poll pages with backoff
        const deadline = Date.now() + 300_000;
        let pollInterval = 3000;
        let pollCount = 0;
        while (Date.now() < deadline) {
          try {
            const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
            const list = Array.isArray(pages?.data) ? pages.data : [];
            console.log(`Poll ${++pollCount}: Found ${list.length} pages`);
            if (list.length > 0) return J(200, { ok: true, pages_count: list.length }, origin);
          } catch (e: any) {
            console.log(`Poll ${pollCount} error:`, e?.status, e?.message);
          }
          await new Promise(r => setTimeout(r, pollInterval));
          pollInterval = Math.min(Math.round(pollInterval * 1.5), 10_000);
        }
        return J(504, { code: "GENERATE_TIMEOUT", hint: "Still processing. Try publish step later.", polls_completed: pollCount }, origin);
      } catch (error: any) {
        return J(502, { code: "GENERATE_FROM_SITEMAP_FAILED", detail: error?.json || error?.message || String(error) }, origin);
      }
    }

    // ---- PUBLISH + SET FRONT PAGE
    if (req.method === "POST" && action === "publish-and-frontpage") {
      try {
        const { website_id } = body || {};
        if (!website_id) return J(400, { error: "Missing website_id" }, origin);

        const deadline = Date.now() + 180_000;
        while (Date.now() < deadline) {
          try {
            const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
            const list: any[] = Array.isArray(pages?.data) ? pages.data : [];
            if (list.length === 0) { await new Promise(r => setTimeout(r, 3000)); continue; }

            // publish all
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

            // set front page heuristics
            const home = list.find((p: any) => /home|accueil/i.test(p?.title) || p?.slug === "home" || p?.is_front_page) ?? list[0];
            if (home) {
              try {
                await tw(`/v1/builder/websites/${website_id}/pages/front/set`, { method: "POST", body: JSON.stringify({ page_id: home.id }), timeoutMs: 30_000 });
              } catch (e: any) { if (![400,409,422].includes(e?.status ?? 0)) throw e; }
            }

            // derive URLs
            let preview_url: string | null = null;
            let admin_url: string | null = null;
            try {
              const dn = await tw(`/v1/hosting/websites/${website_id}/domain-name`, { method: "GET", timeoutMs: 30_000 });
              preview_url = dn?.data?.default_domain_url || dn?.data?.site_url || null;
              admin_url = dn?.data?.admin_url || null;
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
        return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing after 180s" }, origin);
      } catch (error: any) {
        return J(502, { code: "PUBLISH_AND_FRONTPAGE_FAILED", detail: error?.json || error?.message || String(error) }, origin);
      }
    }

    // ---- 404
    return J(404, { error: "NOT_FOUND", hint: "Use GET ?action=health or POST actions: create-website, generate-sitemap, update-design, generate-from-sitemap, publish-and-frontpage" }, origin);
  } catch (err: any) {
    console.error("UNHANDLED_ERROR", err);
    return new Response(JSON.stringify({ code: "UNHANDLED", message: String(err) }), {
      status: 500, headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("origin")) },
    });
  }
});