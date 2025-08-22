// supabase/functions/ai-router/index.ts
// Complete 2-step onboarding Edge Function router

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_BASE = Deno.env.get("TENWEB_API_BASE") || "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // --- CORS: permissive + echo requested headers ---
  const origin = req.headers.get("origin") ?? "";
  const requestedHeaders =
    req.headers.get("access-control-request-headers") ??
    "authorization,apikey,content-type,x-client-info";
  const cors = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": requestedHeaders,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin, Access-Control-Request-Headers",
  } as Record<string, string>;

  const J = (code: number, data: unknown) =>
    new Response(JSON.stringify(data), {
      status: code,
      headers: { "content-type": "application/json", ...cors },
    });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const url = new URL(req.url);
  let body: any = {};
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  // --- action resolver (supports aliases & path suffix) ---
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

  if (req.method === "POST" && !action) {
    return J(400, { code: "MISSING_ACTION", hint: "Add ?action=... or body.action" });
  }

  // --- 10Web fetch helper ---
  const tw = async (path: string, init: RequestInit & { timeoutMs?: number } = {}) => {
    const ctl = new AbortController();
    const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 90_000);
    try {
      // content-length (helps some proxies)
      const b = init.body as string | undefined;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Supabase-Edge-Function/1.0",
        // send both casings to be safe across gateways
        "x-api-key": API_KEY,
        "X-API-Key": API_KEY,
        ...((init.headers as Record<string, string>) ?? {}),
      };
      if (init.method === "POST" && typeof b === "string") {
        headers["Content-Length"] = String(new TextEncoder().encode(b).length);
      }

      const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        signal: ctl.signal,
        headers,
      });

      const txt = await res.text();
      const json = txt ? JSON.parse(txt) : null;

      if (!res.ok) {
        // simple retry on 429/5xx
        if (res.status === 429 || res.status >= 500) {
          await new Promise((r) => setTimeout(r, 2000));
          return await tw(path, { ...init, timeoutMs: init.timeoutMs });
        }
        throw { status: res.status, json, message: `API request failed: ${res.status}` };
      }
      return json;
    } finally {
      clearTimeout(id);
    }
  };

  const slugify = (text: string) =>
    text
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
      return { data: [] };
    }
  };

  const findBySub = async (subdomain: string) => {
    const sites = await listSites();
    return sites.data?.find(
      (s: any) => s.site_url?.includes(`${subdomain}.`) || s.admin_url?.includes(`${subdomain}.`)
    );
  };

  const ensureFreeSub = async (base: string): Promise<string> => {
    let sub = base;
    for (let i = 0; i < 6; i++) {
      try {
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
    throw { code: "NO_FREE_SUBDOMAIN" };
  };

  // -------- actions --------

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
        const result = await tw("/v1/hosting/website", {
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
        return J(200, {
          ok: true,
          website_id: result?.data?.website_id,
          subdomain: sub,
          reused: false,
        });
      } catch (createError: any) {
        if (createError?.name === "AbortError") {
          for (let i = 0; i < 20; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const polled = await findBySub(sub);
            if (polled) return J(200, { ok: true, website_id: polled.id, subdomain: sub, reused: false });
          }
        }
        const code = createError?.json?.error?.code;
        if (code === "error.subdomain_in_use2") return J(409, { code: "SUBDOMAIN_IN_USE" });
        throw createError;
      }
    } catch (error: any) {
      return J(502, { code: "CREATE_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  if (req.method === "POST" && action === "generate-sitemap") {
    try {
      const { website_id, params } = body;
      if (!website_id || !params) return J(400, { error: "Missing website_id or params" });
      if (!params.business_name || !params.business_description) {
        return J(400, { error: "Missing required params: business_name, business_description" });
      }
      if (!params.business_type) params.business_type = "informational";

      const result = await tw("/v1/ai/generate_sitemap", {
        method: "POST",
        body: JSON.stringify({ website_id, params }),
        timeoutMs: 120_000,
      });

      let pages_meta = result.pages_meta || [];
      if (!pages_meta.length) {
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

      return J(200, {
        unique_id: result.unique_id || crypto.randomUUID(),
        pages_meta,
        seo: {
          website_title: result.seo?.website_title || params.business_name,
          website_description: result.seo?.website_description || params.business_description,
          website_keyphrase: result.seo?.website_keyphrase || params.business_name,
        },
        colors: {
          primary_color: result.colors?.primary_color || "#FF7A00",
          secondary_color: result.colors?.secondary_color || "#1E62FF",
          background_dark: result.colors?.background_dark || "#121212",
        },
        fonts: { primary_font: result.fonts?.primary_font || "Inter" },
        website_type: params.business_type === "ecommerce" ? "ecommerce" : "basic",
      });
    } catch (error: any) {
      return J(502, { code: "GENERATE_SITEMAP_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  if (req.method === "POST" && action === "update-design") {
    try {
      const { siteId, design } = body;
      if (!siteId || !design) return J(400, { error: "Missing siteId or design" });

      const hex = /^#[A-Fa-f0-9]{6}$/;
      const { primary_color, secondary_color, background_dark } = design.colors ?? {};
      if (primary_color && !hex.test(primary_color)) return J(400, { error: "Invalid primary_color format" });
      if (secondary_color && !hex.test(secondary_color)) return J(400, { error: "Invalid secondary_color format" });
      if (background_dark && !hex.test(background_dark)) return J(400, { error: "Invalid background_dark format" });

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

      if (error) return J(500, { error: "Failed to update design" });
      return J(200, { ok: true });
    } catch (error: any) {
      return J(500, { code: "UPDATE_DESIGN_FAILED", detail: error?.message ?? error });
    }
  }

  if (req.method === "POST" && action === "generate-from-sitemap") {
    try {
      const { website_id, unique_id, params } = body;
      if (!website_id || !unique_id || !params) {
        return J(400, { error: "Missing website_id, unique_id, or params" });
      }

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
        const msg = JSON.stringify(e?.json || e?.message || e);
        if (e?.status === 422 && e?.json?.error?.details) {
          return J(422, {
            code: "VALIDATION_ERROR",
            error: "Invalid parameters for website generation",
            details: e.json.error.details,
          });
        }
        if (!(msg.includes("Template generation is in progress") || msg.includes("417") || msg.includes("timeout") || msg.includes("504"))) {
          return J(502, { code: "GENERATE_FAILED", detail: e?.json ?? e?.message ?? e });
        }
      }

      const deadline = Date.now() + 180_000;
      while (Date.now() < deadline) {
        try {
          const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
          const list = pages?.data || [];
          if (Array.isArray(list) && list.length > 0) return J(200, { ok: true, pages_count: list.length });
        } catch {}
        await new Promise((r) => setTimeout(r, 3000));
      }
      return J(504, { code: "GENERATE_TIMEOUT", hint: "Still generating after 180s" });
    } catch (error: any) {
      return J(502, { code: "GENERATE_FROM_SITEMAP_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  if (req.method === "POST" && action === "publish-and-frontpage") {
    try {
      const { website_id } = body as any;
      if (!website_id) return J(400, { error: "Missing website_id" });

      const deadline = Date.now() + 180_000;
      while (Date.now() < deadline) {
        try {
          const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
          const list = Array.isArray(pages?.data) ? pages.data : [];
          if (list.length === 0) {
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }

          try {
            await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
              method: "POST",
              timeoutMs: 60_000,
              body: JSON.stringify({ page_ids: list.map((p: any) => p.id) }),
            });
          } catch (e: any) {
            if (![400, 409, 422].includes(e?.status ?? 0)) throw e;
          }

          const home =
            list.find((p: any) => /home/i.test(p?.title) || p?.slug === "home" || p?.is_front_page) ?? list[0];
          if (home) {
            try {
              await tw(`/v1/builder/websites/${website_id}/pages/front/set`, {
                method: "POST",
                timeoutMs: 30_000,
                body: JSON.stringify({ page_id: home.id }),
              });
            } catch (e: any) {
              if (![400, 409, 422].includes(e?.status ?? 0)) throw e;
            }
          }

          let preview_url: string | null = null,
            admin_url: string | null = null;
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

          if (preview_url && admin_url) return J(200, { ok: true, preview_url, admin_url });
        } catch {}
        await new Promise((r) => setTimeout(r, 3000));
      }
      return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing after 180s" });
    } catch (error: any) {
      return J(502, { code: "PUBLISH_AND_FRONTPAGE_FAILED", detail: error?.json ?? error?.message ?? error });
    }
  }

  return J(404, {
    error: "NOT_FOUND",
    hint:
      "use action=health or POST create-website, generate-sitemap, update-design, generate-from-sitemap, publish-and-frontpage",
  });
});