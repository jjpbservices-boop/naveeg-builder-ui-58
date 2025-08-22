// supabase/functions/ai-router/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const API_BASE = Deno.env.get("TENWEB_API_BASE") || "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/* ──────────────────────────────────────────────────────────────
   CORS + Response helper
   ────────────────────────────────────────────────────────────── */
const corsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    /^https?:\/\/localhost(:\d+)?$/i,
    /^https:\/\/.*\.lovable\.app$/i,
    /^https:\/\/.*\.supabase\.co$/i,
    /^https:\/\/.*\.netlify\.app$/i,
    /^https:\/\/.*\.vercel\.app$/i,
  ];
  const isAllowedOrigin = origin && allowedOrigins.some((p) => p.test(origin));
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin! : "*",
    "Access-Control-Allow-Headers":
      "authorization, Authorization, apikey, x-api-key, content-type, x-client-info, x-requested-with, accept, accept-language, cache-control",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
  };
};

const J = (code: number, data: unknown, origin?: string | null) =>
  new Response(JSON.stringify(data), {
    status: code,
    headers: { "content-type": "application/json", ...corsHeaders(origin ?? null) },
  });

/* ──────────────────────────────────────────────────────────────
   10Web fetch helper (safe JSON + retry)
   ────────────────────────────────────────────────────────────── */
const tw = async (path: string, init: RequestInit & { timeoutMs?: number } = {}) => {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 90_000);
  try {
    const bodyStr = typeof init.body === "string" ? init.body : undefined;
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Supabase-Edge-Function/1.0",
      "x-api-key": API_KEY,
      ...((init.headers as Record<string, string>) || {}),
    };
    if (init.method === "POST" && bodyStr) {
      headers["Content-Length"] = String(new TextEncoder().encode(bodyStr).length);
    }

    const hit = async () => {
      const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctl.signal, headers });
      const txt = await res.text();
      let json: any = null;
      try {
        json = txt ? JSON.parse(txt) : null;
      } catch {
        json = null;
      }
      if (!res.ok) throw { status: res.status, json, raw: txt };
      return json;
    };

    try {
      return await hit();
    } catch (e: any) {
      if (e?.status === 429 || e?.status >= 500) {
        await new Promise((r) => setTimeout(r, 1500));
        return await hit();
      }
      throw e;
    }
  } finally {
    clearTimeout(id);
  }
};

/* ──────────────────────────────────────────────────────────────
   Utilities
   ────────────────────────────────────────────────────────────── */
const slugify = (t: string) =>
  (t || "site")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45) || "site";

const subCandidate = (base: string, salt: string) =>
  (base + "-" + salt).toLowerCase().replace(/[^a-z0-9-]+/g, "").slice(0, 45);

const listSites = async () => {
  try {
    return await tw("/v1/account/websites", { method: "GET", timeoutMs: 30_000 });
  } catch {
    return { data: [] };
  }
};

const findBySub = async (sub: string) => {
  const s = await listSites();
  return s.data?.find((w: any) => w?.site_url?.includes(`${sub}.`) || w?.admin_url?.includes(`${sub}.`));
};

const ensureFreeSub = async (base: string) => {
  try {
    await tw("/v1/hosting/websites/subdomain/check", {
      method: "POST",
      body: JSON.stringify({ subdomain: base }),
      timeoutMs: 10_000,
    });
    return base;
  } catch {
    /* in use */
  }
  for (let i = 0; i < 18; i++) {
    const sub = subCandidate(base, Math.random().toString(36).slice(2, 8));
    try {
      await tw("/v1/hosting/websites/subdomain/check", {
        method: "POST",
        body: JSON.stringify({ subdomain: sub }),
        timeoutMs: 10_000,
      });
      return sub;
    } catch {}
  }
  return subCandidate(base, Date.now().toString(36));
};

/* ──────────────────────────────────────────────────────────────
   Generate-from helpers (validated + fallbacks + short polling)
   ────────────────────────────────────────────────────────────── */
function validateGenerationRequest(input: { website_id?: any; unique_id?: any; params?: any }) {
  const { website_id, unique_id, params } = input || {};
  if (!website_id || !unique_id || !params) {
    return { isValid: false, error: { code: "MISSING_REQUIRED_FIELDS", error: "Missing website_id, unique_id, or params" } };
  }
  const required = ["pages_meta", "website_title", "website_description", "website_keyphrase"];
  const missing = required.filter((k) => !params[k]);
  if (missing.length) {
    return {
      isValid: false,
      error: {
        code: "MISSING_REQUIRED_PARAMS",
        error: `Missing required parameters: ${missing.join(", ")}`,
        received: Object.keys(params || {}),
        required,
      },
    };
  }
  return { isValid: true };
}

function buildEnhancedPayload(website_id: number, unique_id: string, params: any) {
  return {
    website_id: Number(website_id),
    unique_id,
    params: {
      // required
      pages_meta: params.pages_meta,
      website_title: params.website_title,
      website_description: params.website_description,
      website_keyphrase: params.website_keyphrase,

      // business
      business_name: params.business_name || params.website_title,
      business_description: params.business_description || params.website_description,
      business_type: params.business_type || "basic",

      // extra SEO hints
      seo: {
        title: params.seo_title || params.website_title,
        description: params.seo_description || params.website_description,
        keyphrase: params.seo_keyphrase || params.website_keyphrase,
      },

      // design (safe defaults)
      colors:
        params.colors || {
          primary_color: "#D4A574",
          secondary_color: "#8B4513",
          background_dark: "#2C1810",
        },
      fonts: params.fonts || { primary_font: "Playfair Display" },

      // misc hints
      website_type: params.website_type || "basic",
      language: params.language || "fr",
      locale: params.locale || "fr_FR",
      industry: params.industry || "food-beverage",
      category: params.category || "bakery",
      tone: params.tone || "warm and artisanal",
      style: params.style || "traditional bakery",

      ...(params.contact ? { contact: params.contact } : {}),
      ...(params.location ? { location: params.location } : {}),
    },
  };
}

function buildMinimalPayload(website_id: number, unique_id: string, params: any) {
  return {
    website_id: Number(website_id),
    unique_id,
    params: {
      pages_meta: params.pages_meta,
      website_title: params.website_title,
      website_description: params.website_description,
      website_keyphrase: params.website_keyphrase,
      business_name: params.business_name || params.website_title,
      business_type: params.business_type || "basic",
    },
  };
}

function buildFlatPayload(website_id: number, unique_id: string, params: any) {
  // still under params to be spec-compatible with 10Web
  return { website_id: Number(website_id), unique_id, params };
}

async function generateSiteWithFallbacks(
  website_id: number,
  unique_id: string,
  params: any,
  twFn: typeof tw,
) {
  const strategies = [
    { name: "enhanced", payload: buildEnhancedPayload(website_id, unique_id, params) },
    { name: "minimal", payload: buildMinimalPayload(website_id, unique_id, params) },
    { name: "flat", payload: buildFlatPayload(website_id, unique_id, params) },
  ] as const;

  const errors: Record<string, unknown> = {};

  for (const s of strategies) {
    try {
      const bodyStr = JSON.stringify(s.payload);
      console.log(`🚀 Trying ${s.name} payload (${bodyStr.length} bytes)`);
      const res = await twFn("/v1/ai/generate_site_from_sitemap", {
        method: "POST",
        body: bodyStr,
        timeoutMs: 30_000, // do not hold edge too long
      });
      console.log(`✅ ${s.name} accepted`, res);
      return { success: true, result: res };
    } catch (e: any) {
      const msg = e?.json?.message || e?.message || "";
      console.log(`❌ ${s.name} failed`, { status: e?.status, message: msg, details: e?.json?.details });

      // "in progress" / timeouts are acceptable (generation already running)
      if (e?.status === 417 || /in progress|timeout|504/i.test(String(msg))) {
        console.log(`ℹ️ ${s.name}: generation already in progress – proceeding`);
        return { success: true, result: { accepted: true } };
      }
      errors[s.name] = { status: e?.status, message: msg, details: e?.json?.details };
    }
  }

  return { success: false, error: { code: "ALL_PAYLOAD_FORMATS_FAILED", details: errors } };
}

async function pollForGenerationCompletionEdgeBudget(
  website_id: number,
  twFn: typeof tw,
  budgetMs = 95_000,
) {
  const start = Date.now();
  let interval = 3000;
  const maxInterval = 10_000;
  let polls = 0;
  let consecutiveErrors = 0;

  while (Date.now() - start < budgetMs) {
    try {
      const pages = await twFn(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 25_000 });
      const list = Array.isArray(pages?.data) ? pages.data : [];
      polls++;
      console.log(`🔎 poll #${polls}: ${list.length} pages`);
      consecutiveErrors = 0;

      if (list.length > 0) {
        const summary = list.map((p: any) => ({ id: p.id, title: p.title, status: p.status }));
        return { done: true, response: { ok: true, pages_count: list.length, pages: summary } };
      }
    } catch (e: any) {
      consecutiveErrors++;
      console.log(`⚠️ poll error (${consecutiveErrors})`, e?.status || e?.message);
      if (consecutiveErrors >= 4) break;
    }

    await new Promise((r) => setTimeout(r, interval));
    interval = Math.min(Math.floor(interval * 1.2), maxInterval);
  }
  return { done: false, response: { ok: true, accepted: true, hint: "continue_client_poll" } };
}

/* ──────────────────────────────────────────────────────────────
   Main router
   ────────────────────────────────────────────────────────────── */
serve(async (req) => {
  const origin = req.headers.get("origin");

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    const url = new URL(req.url);
    let body: any = {};
    if (req.method === "POST") {
      try {
        const text = await req.text();
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
    }

    let action = (url.searchParams.get("action") || body?.action || url.pathname.split("/").pop() || "")
      .toString()
      .trim()
      .toLowerCase();
    const aliases: Record<string, string> = {
      generate: "generate-from-sitemap",
      publish: "publish-and-frontpage",
      sitemap: "generate-sitemap",
      update: "update-design",
    };
    action = aliases[action] || action;

    // Health
    if (req.method === "GET" && action === "health") {
      return J(
        200,
        {
          status: "healthy",
          timestamp: new Date().toISOString(),
          available_actions: ["create-website", "generate-sitemap", "update-design", "generate-from-sitemap", "publish-and-frontpage"],
        },
        origin,
      );
    }

    if (req.method === "POST" && !action) {
      return J(400, { code: "MISSING_ACTION" }, origin);
    }

    // CREATE WEBSITE
    if (req.method === "POST" && action === "create-website") {
      try {
        const businessName = (body.businessName || "New Site").toString().trim();
        const base = slugify(businessName);
        const existing = await findBySub(base);
        if (existing) {
          return J(200, { ok: true, website_id: existing.id, subdomain: base, reused: true }, origin);
        }
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
              const r = await tw("/v1/hosting/website", {
                method: "POST",
                body: JSON.stringify(payload(candidate, "europe-west3-b")), // Frankfurt zone
                timeoutMs: 25_000,
              });
              return J(200, { ok: true, website_id: r?.data?.website_id, subdomain: candidate, reused: false }, origin);
            } catch (e: any) {
              if (e?.status === 400 || e?.status === 422) {
                // region fallback
                const r2 = await tw("/v1/hosting/website", {
                  method: "POST",
                  body: JSON.stringify(payload(candidate, "europe-west3")),
                  timeoutMs: 25_000,
                });
                return J(200, { ok: true, website_id: r2?.data?.website_id, subdomain: candidate, reused: false }, origin);
              }
              throw e;
            }
          } catch (e: any) {
            const msg = JSON.stringify(e?.json || e?.raw || e?.message || "");
            if (e?.status === 409 || /subdomain.*use/i.test(msg)) {
              candidate = subCandidate(base, Math.random().toString(36).slice(2, 8));
              continue;
            }
            if (e?.name === "AbortError") {
              for (let p = 0; p < 20; p++) {
                await new Promise((r) => setTimeout(r, 2000));
                const polled = await findBySub(candidate);
                if (polled) {
                  return J(200, { ok: true, website_id: polled.id, subdomain: candidate, reused: false }, origin);
                }
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

    // GENERATE SITEMAP
    if (req.method === "POST" && action === "generate-sitemap") {
      try {
        const { website_id, params } = body || {};
        if (!website_id || !params) return J(400, { error: "Missing website_id or params" }, origin);
        if (!params.business_name || !params.business_description)
          return J(400, { error: "Missing required params: business_name, business_description" }, origin);
        if (!params.business_type) params.business_type = "informational";

        const result = await tw("/v1/ai/generate_sitemap", {
          method: "POST",
          body: JSON.stringify({ website_id, params }),
          timeoutMs: 120_000,
        });

        let pages_meta = result?.pages_meta || [];
        if (!Array.isArray(pages_meta) || pages_meta.length === 0) {
          pages_meta = [
            { title: "Home", sections: [{ section_title: "Hero" }, { section_title: "About Us" }] },
            { title: "About", sections: [{ section_title: "Our Story" }, { section_title: "Team" }] },
            {
              title: params.business_type === "ecommerce" ? "Products" : "Services",
              sections: [{ section_title: "Our Offerings" }],
            },
            { title: "Contact", sections: [{ section_title: "Get In Touch" }] },
          ];
        }

        return J(
          200,
          {
            unique_id: result?.unique_id || crypto.randomUUID(),
            pages_meta,
            seo: {
              website_title: result?.seo?.website_title || params.business_name,
              website_description: result?.seo?.website_description || params.business_description,
              website_keyphrase: result?.seo?.website_keyphrase || params.business_name,
            },
            colors: {
              primary_color: result?.colors?.primary_color || "#FF7A00",
              secondary_color: result?.colors?.secondary_color || "#1E62FF",
              background_dark: result?.colors?.background_dark || "#121212",
            },
            fonts: { primary_font: result?.fonts?.primary_font || "Inter" },
            website_type: params.business_type === "ecommerce" ? "ecommerce" : "basic",
          },
          origin,
        );
      } catch (error: any) {
        return J(502, { code: "GENERATE_SITEMAP_FAILED", detail: error?.json || error?.message || String(error) }, origin);
      }
    }

    // UPDATE DESIGN
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

        const { error } = await supabase
          .from("sites")
          .update({
            colors: design.colors,
            fonts: design.fonts,
            pages_meta: design.pages_meta,
            seo_title: design.seo?.title,
            seo_description: design.seo?.description,
            seo_keyphrase: design.seo?.keyphrase,
            website_type: design.website_type,
            updated_at: new Date().toISOString(),
          })
          .eq("website_id", siteId);
        if (error) return J(500, { error: "Failed to update design" }, origin);

        return J(200, { ok: true }, origin);
      } catch (error: any) {
        return J(500, { code: "UPDATE_DESIGN_FAILED", detail: error?.message || String(error) }, origin);
      }
    }

    // GENERATE FROM SITEMAP (fallbacks + short polling → 200 or 202)
    if (req.method === "POST" && action === "generate-from-sitemap") {
      try {
        const { website_id, unique_id, params } = body || {};
        const validation = validateGenerationRequest({ website_id, unique_id, params });
        if (!validation.isValid) return J(400, validation.error, origin);

        const generationResult = await generateSiteWithFallbacks(website_id, unique_id, params, tw);
        if (!generationResult.success) return J(502, generationResult.error, origin);

        // short server-side polling (keep edge under time budget)
        const poll = await pollForGenerationCompletionEdgeBudget(website_id, tw, 95_000);
        if (poll.done) return J(200, poll.response, origin);
        return J(202, poll.response, origin); // Accepted; let client continue (then publish/frontpage)
      } catch (error: any) {
        return J(
          502,
          { code: "GENERATE_FROM_SITEMAP_FAILED", detail: error?.json || error?.message || String(error) },
          origin,
        );
      }
    }

    // PUBLISH + FRONT PAGE
    if (req.method === "POST" && action === "publish-and-frontpage") {
      try {
        const { website_id } = body || {};
        if (!website_id) return J(400, { error: "Missing website_id" }, origin);

        const deadline = Date.now() + 180_000;
        while (Date.now() < deadline) {
          try {
            const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
            const list = Array.isArray(pages?.data) ? pages.data : [];
            if (list.length === 0) {
              await new Promise((r) => setTimeout(r, 3000));
              continue;
            }

            // publish
            try {
              await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
                method: "POST",
                body: JSON.stringify({ page_ids: list.map((p: any) => p.id) }),
                timeoutMs: 60_000,
              });
            } catch (e: any) {
              if (![400, 409, 422].includes(e?.status ?? 0)) {
                await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
                  method: "POST",
                  body: JSON.stringify({ action: "publish", page_ids: list.map((p: any) => p.id) }),
                  timeoutMs: 60_000,
                });
              }
            }

            // set front page
            const home =
              list.find((p: any) => /home/i.test(p?.title) || p?.slug === "home" || p?.is_front_page) ?? list[0];
            if (home) {
              try {
                await tw(`/v1/builder/websites/${website_id}/pages/front/set`, {
                  method: "POST",
                  body: JSON.stringify({ page_id: home.id }),
                  timeoutMs: 30_000,
                });
              } catch (e: any) {
                if (![400, 409, 422].includes(e?.status ?? 0)) throw e;
              }
            }

            // resolve URLs
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

            if (preview_url && admin_url) {
              return J(200, { ok: true, preview_url, admin_url }, origin);
            }
          } catch {}
          await new Promise((r) => setTimeout(r, 3000));
        }
        return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing after 180s" }, origin);
      } catch (error: any) {
        return J(502, { code: "PUBLISH_AND_FRONTPAGE_FAILED", detail: error?.json || error?.message || String(error) }, origin);
      }
    }

    // Fallback 404
    return J(
      404,
      {
        error: "NOT_FOUND",
        hint: "Use GET ?action=health or POST actions: create-website, generate-sitemap, update-design, generate-from-sitemap, publish-and-frontpage",
      },
      origin,
    );
  } catch (err: any) {
    console.error("UNHANDLED_ERROR", err);
    return new Response(JSON.stringify({ code: "UNHANDLED", message: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("origin")) },
    });
  }
});