// supabase/functions/ai-router/index.ts
// Complete 2-step onboarding Edge Function router (robust CORS + idempotent 10Web integration)

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// ---- ENV --------------------------------------------------------------------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_BASE = Deno.env.get("TENWEB_API_BASE") || "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY")!;

// ---- SUPABASE ---------------------------------------------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---- UTILITIES --------------------------------------------------------------
const allowOrigin = (origin: string | null) => {
  if (!origin) return "*";
  // Allow localhost, ANY lovable preview, and your builder subdomains.
  const ok =
    /^http:\/\/localhost(:\d+)?$/i.test(origin) ||
    /^https:\/\/.*\.lovable\.app$/i.test(origin);
  return ok ? origin : "*"; // wildcard fallback to avoid CORS block
};

const J = (code: number, data: unknown, corsOrigin: string) =>
  new Response(JSON.stringify(data), {
    status: code,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Headers":
        "authorization, Authorization, apikey, x-api-key, content-type, x-client-info",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });

// 10Web fetch helper (timeouts, JSON parse, retry on 429/5xx)
const tw = async (
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
) => {
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
    if (init.method === "POST" && bodyStr) {
      headers["Content-Length"] = String(new TextEncoder().encode(bodyStr).length);
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctl.signal,
      headers,
    });

    const txt = await res.text();
    const json = txt ? JSON.parse(txt) : null;

    if (!res.ok) {
      // Retry once on 429/5xx
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1500));
        const res2 = await fetch(`${API_BASE}${path}`, {
          ...init,
          signal: ctl.signal,
          headers,
        });
        const txt2 = await res2.text();
        const json2 = txt2 ? JSON.parse(txt2) : null;
        if (!res2.ok) throw { status: res2.status, json: json2 };
        return json2;
      }
      throw { status: res.status, json };
    }
    return json;
  } finally {
    clearTimeout(id);
  }
};

const slugify = (text: string): string =>
  (text || "site")
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
    return { data: [] as any[] };
  }
};

const findBySub = async (subdomain: string) => {
  const sites = await listSites();
  return sites.data?.find(
    (s: any) =>
      s?.site_url?.includes(`${subdomain}.`) || s?.admin_url?.includes(`${subdomain}.`),
  );
};

// Never throws. Finds a free subdomain via /check; if busy, mutate with random salts.
const ensureFreeSub = async (base: string): Promise<string> => {
  // try base
  try {
    await tw("/v1/hosting/websites/subdomain/check", {
      method: "POST",
      body: JSON.stringify({ subdomain: base }),
      timeoutMs: 10_000,
    });
    return base;
  } catch {/* in use – continue */}

  for (let i = 0; i < 18; i++) {
    const sub = subCandidate(base, Math.random().toString(36).slice(2, 8));
    try {
      await tw("/v1/hosting/websites/subdomain/check", {
        method: "POST",
        body: JSON.stringify({ subdomain: sub }),
        timeoutMs: 10_000,
      });
      return sub;
    } catch {/* try next */}
  }
  // final fallback – timestamped
  return subCandidate(base, Date.now().toString(36));
};

// ---- SERVER -----------------------------------------------------------------
serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsOrigin = allowOrigin(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Headers":
          "authorization, Authorization, apikey, x-api-key, content-type, x-client-info",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      },
    });
  }

  const url = new URL(req.url);
  let body: any = {};
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  // Action resolver + aliases
  let action = (
    url.searchParams.get("action") ||
    body?.action ||
    url.pathname.split("/").pop() ||
    ""
  )
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

  // ---- HEALTH ---------------------------------------------------------------
  if (req.method === "GET" && action === "health") {
    return J(
      200,
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        available_actions: [
          "create-website",
          "generate-sitemap",
          "update-design",
          "generate-from-sitemap",
          "publish-and-frontpage",
        ],
      },
      corsOrigin,
    );
  }

  if (req.method === "POST" && !action) {
    return J(400, { code: "MISSING_ACTION", hint: "Add ?action=... or body.action" }, corsOrigin);
  }

  // ---- CREATE WEBSITE (idempotent, collision-safe) --------------------------
  if (req.method === "POST" && action === "create-website") {
    try {
      const businessName = (body.businessName || "New Site").toString().trim();
      const base = slugify(businessName);

      // idempotency by existing sub
      const existing = await findBySub(base);
      if (existing) {
        return J(200, { ok: true, website_id: existing.id, subdomain: base, reused: true }, corsOrigin);
      }

      let candidate = await ensureFreeSub(base);

      const payload = (sub: string, region: string) => ({
        subdomain: sub,
        region,
        site_title: businessName,
        admin_username: "admin",
        admin_password: crypto.randomUUID().replace(/-/g, "").slice(0, 16) + "Aa1!",
      });

      // up to 12 attempts to dodge race collisions
      for (let i = 0; i < 12; i++) {
        try {
          // prefer explicit zone; fallback to region if 400/422
          try {
            const r = await tw("/v1/hosting/website", {
              method: "POST",
              body: JSON.stringify(payload(candidate, "europe-west3-b")),
              timeoutMs: 25_000,
            });
            return J(200, { ok: true, website_id: r?.data?.website_id, subdomain: candidate, reused: false }, corsOrigin);
          } catch (e: any) {
            if (e?.status === 400 || e?.status === 422) {
              const r2 = await tw("/v1/hosting/website", {
                method: "POST",
                body: JSON.stringify(payload(candidate, "europe-west3")),
                timeoutMs: 25_000,
              });
              return J(200, { ok: true, website_id: r2?.data?.website_id, subdomain: candidate, reused: false }, corsOrigin);
            }
            throw e;
          }
        } catch (e: any) {
          const msg = JSON.stringify(e?.json || e?.message || "");
          if (e?.status === 409 || msg.includes("subdomain in use")) {
            candidate = subCandidate(base, Math.random().toString(36).slice(2, 8));
            continue;
          }
          // If request timed out, poll for presence
          if (e?.name === "AbortError") {
            for (let p = 0; p < 20; p++) {
              await new Promise((r) => setTimeout(r, 2000));
              const polled = await findBySub(candidate);
              if (polled) {
                return J(200, { ok: true, website_id: polled.id, subdomain: candidate, reused: false }, corsOrigin);
              }
            }
          }
          throw e;
        }
      }

      return J(409, { code: "SUBDOMAIN_EXHAUSTED", detail: "Could not secure a free subdomain." }, corsOrigin);
    } catch (error: any) {
      const status = error?.status || 502;
      return J(status, { code: "CREATE_FAILED", status, detail: error?.json || error?.message || String(error) }, corsOrigin);
    }
  }

  // ---- GENERATE SITEMAP -----------------------------------------------------
  if (req.method === "POST" && action === "generate-sitemap") {
    try {
      const { website_id, params } = body || {};
      if (!website_id || !params) return J(400, { error: "Missing website_id or params" }, corsOrigin);
      if (!params.business_name || !params.business_description) {
        return J(400, { error: "Missing required params: business_name, business_description" }, corsOrigin);
      }
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
          { title: params.business_type === "ecommerce" ? "Products" : "Services", sections: [{ section_title: "Our Offerings" }] },
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
        corsOrigin,
      );
    } catch (error: any) {
      return J(502, { code: "GENERATE_SITEMAP_FAILED", detail: error?.json || error?.message || String(error) }, corsOrigin);
    }
  }

  // ---- UPDATE DESIGN (DB only) ----------------------------------------------
  if (req.method === "POST" && action === "update-design") {
    try {
      const { siteId, design } = body || {};
      if (!siteId || !design) return J(400, { error: "Missing siteId or design" }, corsOrigin);

      const hex = /^#[0-9a-f]{6}$/i;
      const { colors } = design || {};
      if (colors) {
        const { primary_color, secondary_color, background_dark } = colors;
        if (primary_color && !hex.test(primary_color)) return J(400, { error: "Invalid primary_color format" }, corsOrigin);
        if (secondary_color && !hex.test(secondary_color)) return J(400, { error: "Invalid secondary_color format" }, corsOrigin);
        if (background_dark && !hex.test(background_dark)) return J(400, { error: "Invalid background_dark format" }, corsOrigin);
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

      if (error) return J(500, { error: "Failed to update design" }, corsOrigin);
      return J(200, { ok: true }, corsOrigin);
    } catch (error: any) {
      return J(500, { code: "UPDATE_DESIGN_FAILED", detail: error?.message || String(error) }, corsOrigin);
    }
  }

  // ---- GENERATE FROM SITEMAP ------------------------------------------------
  if (req.method === "POST" && action === "generate-from-sitemap") {
    try {
      const { website_id, unique_id, params } = body || {};
      if (!website_id || !unique_id || !params) {
        return J(400, { error: "Missing website_id, unique_id, or params" }, corsOrigin);
      }

      const required = ["pages_meta", "website_title", "website_description", "website_keyphrase"];
      const missing = required.filter((k) => !params[k]);
      if (missing.length) {
        return J(
          400,
          {
            code: "MISSING_REQUIRED_PARAMS",
            error: `Missing required parameters: ${missing.join(", ")}`,
            received: Object.keys(params || {}),
            required,
          },
          corsOrigin,
        );
      }

      // Kick off generation (tolerate 417/504/timeouts by polling)
      let startOk = false;
      try {
        await tw("/v1/ai/generate_site_from_sitemap", {
          method: "POST",
          body: JSON.stringify({ website_id, unique_id, params }),
          timeoutMs: 60_000,
        });
        startOk = true;
      } catch (e: any) {
        if (
          e?.status === 417 ||
          String(JSON.stringify(e?.json || e?.message || "")).includes("in progress") ||
          e?.name === "AbortError" ||
          e?.status === 504
        ) {
          // proceed to poll
        } else if (e?.status === 422 && e?.json?.error?.details) {
          return J(
            422,
            { code: "VALIDATION_ERROR", error: "Invalid parameters", details: e.json.error.details },
            corsOrigin,
          );
        } else {
          return J(502, { code: "GENERATE_FAILED", detail: e?.json || e?.message || String(e) }, corsOrigin);
        }
      }

      // Poll pages for readiness (3 minutes)
      const deadline = Date.now() + 180_000;
      while (Date.now() < deadline) {
        try {
          const pages = await tw(`/v1/builder/websites/${website_id}/pages`, {
            method: "GET",
            timeoutMs: 30_000,
          });
          const list = Array.isArray(pages?.data) ? pages.data : [];
          if (list.length > 0) return J(200, { ok: true, pages_count: list.length, started: startOk }, corsOrigin);
        } catch {
          // ignore transient
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      return J(504, { code: "GENERATE_TIMEOUT", hint: "Still generating after 180s" }, corsOrigin);
    } catch (error: any) {
      return J(502, { code: "GENERATE_FROM_SITEMAP_FAILED", detail: error?.json || error?.message || String(error) }, corsOrigin);
    }
  }

  // ---- PUBLISH + FRONT PAGE + URLS -----------------------------------------
  if (req.method === "POST" && action === "publish-and-frontpage") {
    try {
      const { website_id } = body || {};
      if (!website_id) return J(400, { error: "Missing website_id" }, corsOrigin);

      const deadline = Date.now() + 180_000;
      while (Date.now() < deadline) {
        try {
          const pages = await tw(`/v1/builder/websites/${website_id}/pages`, {
            method: "GET",
            timeoutMs: 30_000,
          });
          const list: any[] = Array.isArray(pages?.data) ? pages.data : [];
          if (list.length === 0) {
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }

          // publish all – try both payload variants
          try {
            await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
              method: "POST",
              body: JSON.stringify({ page_ids: list.map((p: any) => p.id) }),
              timeoutMs: 60_000,
            });
          } catch (e: any) {
            if (![400, 409, 422].includes(e?.status ?? 0)) {
              // try alternate shape
              await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
                method: "POST",
                body: JSON.stringify({ action: "publish", page_ids: list.map((p: any) => p.id) }),
                timeoutMs: 60_000,
              });
            }
          }

          // set front page (best effort)
          const home =
            list.find((p: any) => /home/i.test(p?.title) || p?.slug === "home" || p?.is_front_page) ??
            list[0];
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
            const dn = await tw(`/v1/hosting/websites/${website_id}/domain-name`, {
              method: "GET",
              timeoutMs: 30_000,
            });
            preview_url = dn?.data?.default_domain_url || dn?.data?.site_url || null;
            admin_url = dn?.data?.admin_url || null;
          } catch {
            // ignore
          }
          if (!preview_url || !admin_url) {
            const acc = await listSites();
            const hit = acc?.data?.find?.((w: any) => w?.id === website_id);
            const sub = hit?.subdomain;
            preview_url = preview_url || hit?.site_url || (sub ? `https://${sub}.10web.site` : null);
            admin_url = admin_url || hit?.admin_url || (sub ? `https://${sub}.10web.site/wp-admin` : null);
          }

          if (preview_url && admin_url) {
            return J(200, { ok: true, preview_url, admin_url }, corsOrigin);
          }
        } catch {
          // ignore and retry
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing after 180s" }, corsOrigin);
    } catch (error: any) {
      return J(502, { code: "PUBLISH_AND_FRONTPAGE_FAILED", detail: error?.json || error?.message || String(error) }, corsOrigin);
    }
  }

  // ---- 404 ------------------------------------------------------------------
  return J(
    404,
    {
      error: "NOT_FOUND",
      hint:
        "Use GET ?action=health or POST actions: create-website, generate-sitemap, update-design, generate-from-sitemap, publish-and-frontpage",
    },
    corsOrigin,
  );
});