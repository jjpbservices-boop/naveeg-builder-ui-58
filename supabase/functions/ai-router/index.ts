// supabase/functions/ai-router/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const API_BASE = Deno.env.get("TENWEB_API_BASE") || "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS helpers
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin &&
    (/^http:\/\/localhost(:\d+)?$/i.test(origin) ||
      /^https:\/\/.*\.lovable\.app$/i.test(origin))
      ? origin
      : "*",
  "Access-Control-Allow-Headers":
    "authorization, Authorization, apikey, x-api-key, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const J = (code: number, data: unknown, origin: string | null) =>
  new Response(JSON.stringify(data), {
    status: code,
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });

// 10Web fetch helper (safe JSON + retry)
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
      headers["Content-Length"] = String(
        new TextEncoder().encode(bodyStr).length,
      );
    }

    const hit = async () => {
      const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        signal: ctl.signal,
        headers,
      });
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
    return { data: [] as any[] };
  }
};
const findBySub = async (sub: string) => {
  const s = await listSites();
  return s.data?.find(
    (w: any) => w?.site_url?.includes(`${sub}.`) || w?.admin_url?.includes(`${sub}.`),
  );
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
    } catch {/* next */}
  }
  return subCandidate(base, Date.now().toString(36));
};

serve(async (req) => {
  const origin = req.headers.get("origin");

  // Always answer preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  try {
    const url = new URL(req.url);
    let body: any = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    let action =
      (
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
                body: JSON.stringify(payload(candidate, "europe-west3-b")),
                timeoutMs: 25_000,
              });
              return J(200, { ok: true, website_id: r?.data?.website_id, subdomain: candidate, reused: false }, origin);
            } catch (e: any) {
              if (e?.status === 400 || e?.status === 422) {
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
        if (!website_id || !params)
          return J(400, { error: "Missing website_id or params" }, origin);
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

    // GENERATE FROM SITEMAP
    if (req.method === "POST" && action === "generate-from-sitemap") {
      try {
        const { website_id, unique_id, params } = body || {};
        if (!website_id || !unique_id || !params)
          return J(400, { error: "Missing website_id, unique_id, or params" }, origin);

        const required = ["pages_meta", "website_title", "website_description", "website_keyphrase"];
        const missing = required.filter((k) => !params[k]);
        if (missing.length) {
          return J(400, {
            code: "MISSING_REQUIRED_PARAMS",
            error: `Missing required parameters: ${missing.join(", ")}`,
            received: Object.keys(params || {}),
            required,
          }, origin);
        }

        try {
          await tw("/v1/ai/generate_site_from_sitemap", {
            method: "POST",
            body: JSON.stringify({ website_id, unique_id, params }),
            timeoutMs: 60_000,
          });
        } catch (e: any) {
          const msg = JSON.stringify(e?.json || e?.raw || e?.message || "");
          if (e?.status === 422 && e?.json?.error?.details) {
            return J(422, { code: "VALIDATION_ERROR", details: e.json.error.details }, origin);
          }
          if (
            e?.status === 417 ||
            e?.status === 504 ||
            e?.name === "AbortError" ||
            /in progress/i.test(msg)
          ) {
            // proceed to poll
          } else {
            return J(502, { code: "GENERATE_FAILED", detail: e?.json || e?.message || String(e) }, origin);
          }
        }

        const deadline = Date.now() + 180_000;
        while (Date.now() < deadline) {
          try {
            const pages = await tw(`/v1/builder/websites/${website_id}/pages`, {
              method: "GET",
              timeoutMs: 30_000,
            });
            const list = Array.isArray(pages?.data) ? pages.data : [];
            if (list.length > 0) return J(200, { ok: true, pages_count: list.length }, origin);
          } catch {}
          await new Promise((r) => setTimeout(r, 3000));
        }
        return J(504, { code: "GENERATE_TIMEOUT", hint: "Still generating after 180s" }, origin);
      } catch (error: any) {
        return J(502, { code: "GENERATE_FROM_SITEMAP_FAILED", detail: error?.json || error?.message || String(error) }, origin);
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
            const pages = await tw(`/v1/builder/websites/${website_id}/pages`, {
              method: "GET",
              timeoutMs: 30_000,
            });
            const list: any[] = Array.isArray(pages?.data) ? pages.data : [];
            if (list.length === 0) {
              await new Promise((r) => setTimeout(r, 3000));
              continue;
            }

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

            let preview_url: string | null = null;
            let admin_url: string | null = null;
            try {
              const dn = await tw(`/v1/hosting/websites/${website_id}/domain-name`, {
                method: "GET",
                timeoutMs: 30_000,
              });
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

    return J(
      404,
      {
        error: "NOT_FOUND",
        hint:
          "Use GET ?action=health or POST actions: create-website, generate-sitemap, update-design, generate-from-sitemap, publish-and-frontpage",
      },
      origin,
    );
  } catch (err) {
    // GUARANTEED CORS ON UNHANDLED FAILURES
    console.error("UNHANDLED_ERROR", err);
    return new Response(JSON.stringify({ code: "UNHANDLED", message: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders(req.headers.get("origin")) },
    });
  }
});
// Test script to debug 10Web API issues
// Add this temporarily to your ai-router function for debugging

const debugTenWebAPI = async () => {
  console.log("🔍 Starting 10Web API Debug...");
  
  // Test 1: Check API key validity
  try {
    console.log("📡 Testing API key with account info...");
    const accountInfo = await tw("/v1/account", {
      method: "GET",
      timeoutMs: 30_000
    });
    console.log("✅ API Key valid - Account info:", accountInfo);
  } catch (e) {
    console.log("❌ API Key test failed:", e);
    return false;
  }

  // Test 2: Check website exists
  try {
    console.log(`📡 Checking if website ${website_id} exists...`);
    const websiteInfo = await tw(`/v1/hosting/websites/${website_id}`, {
      method: "GET",
      timeoutMs: 30_000
    });
    console.log("✅ Website exists:", websiteInfo);
  } catch (e) {
    console.log("❌ Website check failed:", e);
    return false;
  }

  // Test 3: Check current pages (before generation)
  try {
    console.log(`📡 Checking existing pages for website ${website_id}...`);
    const existingPages = await tw(`/v1/builder/websites/${website_id}/pages`, {
      method: "GET",
      timeoutMs: 30_000
    });
    console.log("📄 Existing pages:", existingPages);
  } catch (e) {
    console.log("⚠️ Could not fetch existing pages:", e);
  }

  return true;
};

// Modified generate-from-sitemap section with debugging
if (req.method === "POST" && action === "generate-from-sitemap") {
  try {
    const { website_id, unique_id, params } = body || {};
    if (!website_id || !unique_id || !params) {
      return J(400, { 
        error: "Missing website_id, unique_id, or params" 
      }, origin);
    }

    // Debug API first
    const apiWorking = await debugTenWebAPI();
    if (!apiWorking) {
      return J(502, { 
        code: "API_DEBUG_FAILED",
        hint: "Check logs for API debugging details"
      }, origin);
    }

    const required = [
      "pages_meta",
      "website_title", 
      "website_description",
      "website_keyphrase"
    ];
    const missing = required.filter(k => !params[k]);
    
    if (missing.length) {
      return J(400, {
        code: "MISSING_REQUIRED_PARAMS",
        error: `Missing required parameters: ${missing.join(", ")}`,
        received: Object.keys(params || {}),
        required
      }, origin);
    }

    // Log the EXACT payload being sent
    const generationPayload = {
      website_id,
      unique_id,
      params
    };
    console.log("🚀 EXACT Generation Payload:", JSON.stringify(generationPayload, null, 2));

    // Check payload size
    const payloadSize = JSON.stringify(generationPayload).length;
    console.log(`📦 Payload size: ${payloadSize} characters`);
    
    if (payloadSize > 50000) { // 50KB limit common for APIs
      console.log("⚠️ Payload might be too large!");
    }

    try {
      console.log("📡 Calling 10Web generation API...");
      const startTime = Date.now();
      
      const result = await tw("/v1/ai/generate_site_from_sitemap", {
        method: "POST",
        body: JSON.stringify(generationPayload),
        timeoutMs: 120_000
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Generation API succeeded in ${duration}ms:`, result);
      
      // Skip polling if API succeeded
      return J(200, { 
        ok: true,
        message: "Generation started successfully",
        result: result
      }, origin);
      
    } catch (e) {
      console.log("❌ Generation API failed:", {
        status: e?.status,
        statusCode: e?.json?.statusCode,
        message: e?.json?.message,
        details: e?.json?.details,
        error: e?.json?.error,
        raw: e?.raw,
        fullError: e
      });

      // Try alternative payload formats
      console.log("🔄 Trying alternative payload format...");
      
      // Alternative 1: Flatten the structure
      const altPayload1 = {
        website_id,
        unique_id,
        ...params // Spread params directly
      };
      
      try {
        console.log("📡 Trying flattened payload:", JSON.stringify(altPayload1, null, 2));
        const altResult = await tw("/v1/ai/generate_site_from_sitemap", {
          method: "POST",
          body: JSON.stringify(altPayload1),
          timeoutMs: 120_000
        });
        console.log("✅ Alternative payload worked!", altResult);
        return J(200, { ok: true, result: altResult }, origin);
      } catch (altError) {
        console.log("❌ Alternative payload also failed:", altError);
      }

      return J(502, {
        code: "GENERATE_FAILED",
        originalError: {
          status: e?.status,
          message: e?.json?.message || e?.message,
          details: e?.json?.details
        },
        hint: "Check the detailed logs above for the exact error"
      }, origin);
    }

    // Rest of your polling code...
  } catch (error) {
    console.log("💥 Unexpected error:", error);
    return J(502, {
      code: "UNEXPECTED_ERROR",
      detail: error?.message || String(error)
    }, origin);
  }
}