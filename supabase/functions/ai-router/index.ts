// supabase/functions/ai-router/index.ts
// Complete 2-step onboarding Edge Function router (10Web v1)

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_BASE = Deno.env.get("TENWEB_API_BASE") || "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------- utils ----------
type TWInit = RequestInit & { timeoutMs?: number };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const tw = async (path: string, init: TWInit = {}) => {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 90_000);
  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "Supabase-Edge-Function/1.0",
      // Header name is case-insensitive, set both just in case.
      "x-api-key": API_KEY,
      "X-API-Key": API_KEY,
      ...(init.headers as Record<string, string>),
    };

    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctl.signal, headers });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
      // Retry once on 429/5xx
      if (res.status === 429 || res.status >= 500) {
        await sleep(1500);
        return await tw(path, init);
      }
      const err: any = new Error(`10Web ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.json = json;
      throw err;
    }
    return json;
  } finally {
    clearTimeout(id);
  }
};

const slugify = (text: string) =>
  (text || "site")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45) || "site";

const listSites = async () => {
  try {
    return await tw("/v1/account/websites", { method: "GET", timeoutMs: 30_000 });
  } catch {
    return { data: [] as any[] };
  }
};

const findBySub = async (sub: string) => {
  const sites = await listSites();
  return sites.data?.find(
    (w: any) =>
      w?.site_url?.includes(`${sub}.`) ||
      w?.admin_url?.includes(`${sub}.`) ||
      w?.name?.includes(`${sub}.`),
  );
};

const ensureFreeSub = async (base: string): Promise<string> => {
  let sub = base;
  for (let i = 0; i < 6; i++) {
    try {
      // 200 => available
      await tw("/v1/hosting/websites/subdomain/check", {
        method: "POST",
        body: JSON.stringify({ subdomain: sub }),
        timeoutMs: 15_000,
      });
      return sub;
    } catch {
      try {
        const g = await tw("/v1/hosting/websites/subdomain/generate", {
          method: "POST",
          timeoutMs: 15_000,
        });
        sub = g?.subdomain || `${base}-${crypto.randomUUID().slice(0, 8)}`;
      } catch {
        sub = `${base}-${Date.now().toString(36)}`;
      }
    }
  }
  throw Object.assign(new Error("No free subdomain"), { code: "NO_FREE_SUBDOMAIN" });
};

// ---------- server ----------
serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const allowed = [/^https?:\/\/localhost(:\d+)?$/, /^https:\/\/.*\.lovable\.app$/].some((r) => r.test(origin));
  const corsOrigin = allowed ? origin : "*"; // avoid CORS failures in preview

  const cors = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-api-key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  const J = (code: number, data: unknown) =>
    new Response(JSON.stringify(data), { status: code, headers: { "content-type": "application/json", ...cors } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = new URL(req.url);
  let body: any = {};
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  // resolve action (query, body, or last path segment)
  const alias: Record<string, string> = {
    generate: "generate-from-sitemap",
    publish: "publish-and-frontpage",
    sitemap: "generate-sitemap",
    update: "update-design",
  };
  let action =
    (url.searchParams.get("action") ||
      body?.action ||
      url.pathname.split("/").filter(Boolean).pop() ||
      "")!
      .toString()
      .trim()
      .toLowerCase();
  action = alias[action] || action;

  if (req.method === "GET" && action === "health") {
    return J(200, {
      status: "healthy",
      timestamp: new Date().toISOString(),
      available_actions: [
        "create-website",
        "generate-sitemap",
        "update-design",
        "generate-from-sitemap",
        "publish-and-frontpage",
      ],
    });
  }

  if (req.method === "POST" && !action) {
    return J(400, { code: "MISSING_ACTION", hint: "Add ?action=... or body.action" });
  }

  // ---------- create-website ----------
  if (req.method === "POST" && action === "create-website") {
    try {
      const businessName = body.businessName || "New Site";
      const base = slugify(businessName);

      const existing = await findBySub(base);
      if (existing) {
        return J(200, { ok: true, website_id: existing.id, subdomain: base, reused: true });
      }

      const sub = await ensureFreeSub(base);

      try {
        const res = await tw("/v1/hosting/website", {
          method: "POST",
          body: JSON.stringify({
            subdomain: sub,
            region: "europe-west3-b",
            site_title: businessName,
            admin_username: "admin",
            admin_password: crypto.randomUUID().replace(/-/g, "").slice(0, 16) + "Aa1!",
          }),
          timeoutMs: 25_000,
        });
        return J(200, { ok: true, website_id: res?.data?.website_id, subdomain: sub, reused: false });
      } catch (e: any) {
        if (e?.name === "AbortError") {
          for (let i = 0; i < 20; i++) {
            await sleep(2000);
            const polled = await findBySub(sub);
            if (polled) return J(200, { ok: true, website_id: polled.id, subdomain: sub, reused: false });
          }
        }
        const code = e?.json?.error?.code;
        if (code === "error.subdomain_in_use2") return J(409, { code: "SUBDOMAIN_IN_USE" });
        throw e;
      }
    } catch (error: any) {
      console.error("Create website error:", error);
      return J(502, { code: "CREATE_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  // ---------- generate-sitemap ----------
  if (req.method === "POST" && action === "generate-sitemap") {
    try {
      const { website_id, params } = body || {};
      if (!website_id || !params) return J(400, { error: "Missing website_id or params" });

      if (!params.business_name || !params.business_description) {
        return J(400, { error: "Missing required params: business_name, business_description" });
      }
      if (!params.business_type) params.business_type = "informational";

      const resp = await tw("/v1/ai/generate_sitemap", {
        method: "POST",
        body: JSON.stringify({ website_id, params }),
        timeoutMs: 120_000,
      }); // returns {msg,status,data:{...}} per spec

      const data = resp?.data || {};
      let pages_meta = Array.isArray(data.pages_meta) ? data.pages_meta : [];

      if (!pages_meta.length) {
        pages_meta = [
          { title: "Home", sections: [{ section_title: "Hero" }, { section_title: "About Us" }] },
          { title: "About Us", sections: [{ section_title: "Our Story" }] },
          { title: params.business_type === "ecommerce" ? "Products" : "Services", sections: [{ section_title: "Our Offerings" }] },
          { title: "Contact", sections: [{ section_title: "Get In Touch" }] },
        ];
      }

      return J(200, {
        unique_id: data.unique_id || crypto.randomUUID(),
        pages_meta,
        seo: {
          website_title: data.website_title || params.business_name,
          website_description: data.website_description || params.business_description,
          website_keyphrase: data.website_keyphrase || params.business_name,
        },
        colors: {
          primary_color: data?.colors?.primary_color || "#FF7A00",
          secondary_color: data?.colors?.secondary_color || "#1E62FF",
          background_dark: data?.colors?.background_dark || "#121212",
        },
        fonts: { primary_font: data?.fonts?.primary_font || "Inter" },
        website_type: data.website_type || (params.business_type === "ecommerce" ? "ecommerce" : "basic"),
      });
    } catch (error: any) {
      console.error("Generate sitemap error:", error);
      return J(502, { code: "GENERATE_SITEMAP_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  // ---------- update-design ----------
  if (req.method === "POST" && action === "update-design") {
    try {
      const { siteId, design } = body || {};
      if (!siteId || !design) return J(400, { error: "Missing siteId or design" });

      const hex = /^#[A-Fa-f0-9]{6}$/;
      const c = design.colors || {};
      if (c.primary_color && !hex.test(c.primary_color)) return J(400, { error: "Invalid primary_color format" });
      if (c.secondary_color && !hex.test(c.secondary_color)) return J(400, { error: "Invalid secondary_color format" });
      if (c.background_dark && !hex.test(c.background_dark)) return J(400, { error: "Invalid background_dark format" });

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

      if (error) {
        console.error("Supabase update error:", error);
        return J(500, { error: "Failed to update design" });
      }
      return J(200, { ok: true });
    } catch (error: any) {
      console.error("Update design error:", error);
      return J(500, { code: "UPDATE_DESIGN_FAILED", detail: error?.message ?? error });
    }
  }

  // ---------- generate-from-sitemap ----------
  if (req.method === "POST" && action === "generate-from-sitemap") {
    try {
      const { website_id, unique_id, params } = body || {};
      if (!website_id || !unique_id || !params) return J(400, { error: "Missing website_id, unique_id, or params" });

      const required = ["pages_meta", "website_title", "website_description", "website_keyphrase"];
      const missing = required.filter((k) => !params[k]);
      if (missing.length) {
        return J(400, {
          code: "MISSING_REQUIRED_PARAMS",
          error: `Missing required parameters: ${missing.join(", ")}`,
          received: Object.keys(params),
          required,
        });
      }

      try {
        await tw("/v1/ai/generate_site_from_sitemap", {
          method: "POST",
          body: JSON.stringify({ website_id, unique_id, params }),
          timeoutMs: 60_000,
        });
      } catch (e: any) {
        const txt = JSON.stringify(e?.json || e?.message || e);
        if (e?.status === 422 && e?.json?.error?.details) {
          return J(422, {
            code: "VALIDATION_ERROR",
            error: "Invalid parameters for website generation",
            details: e.json.error.details,
          });
        }
        if (!(txt.includes("Template generation is in progress") || txt.includes("417") || txt.includes("timeout") || txt.includes("504"))) {
          return J(502, { code: "GENERATE_FAILED", detail: e?.json ?? e?.message ?? e });
        }
      }

      // Poll pages (up to 3 minutes)
      const end = Date.now() + 180_000;
      while (Date.now() < end) {
        try {
          const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
          const list = Array.isArray(pages?.data) ? pages.data : [];
          if (list.length > 0) return J(200, { ok: true, pages_count: list.length });
        } catch {
          /* ignore transient */
        }
        await sleep(3000);
      }
      return J(504, { code: "GENERATE_TIMEOUT", hint: "Still generating after 180s" });
    } catch (error: any) {
      console.error("Generate from sitemap error:", error);
      return J(502, { code: "GENERATE_FROM_SITEMAP_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  // ---------- publish-and-frontpage ----------
  if (req.method === "POST" && action === "publish-and-frontpage") {
    try {
      const { website_id } = body || {};
      if (!website_id) return J(400, { error: "Missing website_id" });

      const end = Date.now() + 180_000;
      while (Date.now() < end) {
        try {
          const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
          const list: any[] = Array.isArray(pages?.data) ? pages.data : [];
          if (!list.length) {
            await sleep(3000);
            continue;
          }

          // publish (spec requires action + page_ids)
          try {
            await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
              method: "POST",
              timeoutMs: 60_000,
              body: JSON.stringify({ action: "publish", page_ids: list.map((p: any) => p.ID ?? p.id) }),
            });
          } catch (e: any) {
            if (![400, 409, 422].includes(e?.status ?? 0)) throw e;
          }

          // set front page
          const home =
            list.find((p: any) => /home/i.test(p?.title) || p?.slug === "home" || p?.page_on_front || p?.is_front_page) ??
            list[0];
          if (home?.ID || home?.id) {
            try {
              await tw(`/v1/builder/websites/${website_id}/pages/front/set`, {
                method: "POST",
                timeoutMs: 30_000,
                body: JSON.stringify({ page_id: home.ID ?? home.id }),
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
            const arr: any[] = Array.isArray(dn?.data) ? dn.data : [];
            const def = arr.find((d: any) => d.default === 1) || arr[0];
            preview_url = def?.site_url || null;
            admin_url = def?.admin_url || null;
          } catch {
            /* ignore */
          }

          if (!preview_url || !admin_url) {
            const acc = await listSites();
            const hit = acc?.data?.find?.((w: any) => w?.id === website_id);
            if (hit) {
              preview_url = preview_url || hit?.site_url || null;
              admin_url = admin_url || hit?.admin_url || null;
            }
          }

          if (preview_url && admin_url) return J(200, { ok: true, preview_url, admin_url });
        } catch {
          /* ignore transient */
        }
        await sleep(3000);
      }
      return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing after 180s" });
    } catch (error: any) {
      console.error("Publish/front error:", error);
      return J(502, { code: "PUBLISH_AND_FRONTPAGE_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  return J(404, {
    error: "NOT_FOUND",
    hint:
      "use action=health or POST create-website, generate-sitemap, update-design, generate-from-sitemap, publish-and-frontpage",
  });
});