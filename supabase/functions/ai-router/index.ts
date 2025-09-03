// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders, handleCors } from "../_shared/cors.ts"

const ok = (data: any, req: Request, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(req),
    },
  })

const err = (message: string, req: Request, status = 400) =>
  ok({ ok: false, message }, req, status)

// ---- Database helpers
async function getDraftRow(draft_id: string) {
  const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SB_SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const r = await fetch(`${SB_URL}/rest/v1/site_drafts?id=eq.${draft_id}&select=*`, {
    headers: { apikey: SB_SVC, authorization: `Bearer ${SB_SVC}` },
  });
  const rows = await r.json().catch(() => []);
  return { ok: r.ok, rows };
}

async function updateDraft(draft_id: string, patch: Record<string, unknown>) {
  const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SB_SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const r = await fetch(`${SB_URL}/rest/v1/site_drafts?id=eq.${draft_id}`, {
    method: "PATCH",
    headers: {
      apikey: SB_SVC,
      authorization: `Bearer ${SB_SVC}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });
  const out = await r.json().catch(() => ({}));
  return { ok: r.ok, out };
}

// ---- 10Web call helper
const TW_BASE = Deno.env.get("TENWEB_API_BASE") ?? "https://api.10web.io"
const TW_KEY  = Deno.env.get("TENWEB_API_KEY")  ?? ""

async function createWebsite(payload: {
  subdomain: string; region: string; site_title: string;
  admin_username: string; admin_password: string;
}, timeoutMs = 25_000): Promise<{ website_id: string; [k: string]: unknown }> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${TW_BASE}/websites`, {
      method: "POST",
      headers: { "x-api-key": TW_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const e: any = new Error("TENWEB_ERROR"); e.status = res.status; e.body = json; throw e;
    }
    return { website_id: json.website_id || json.id || "", ...json };
  } finally { clearTimeout(t); }
}

// ---- Region fallback logic - single instance
const ALLOWED_ZONES = ["europe-west3-a","europe-west3-b","europe-west3-c"] as const;
const FALLBACK_REGION = "europe-west3";

function generateCredentials() {
  const r = crypto.getRandomValues(new Uint32Array(2)).join("");
  return { admin_username: `nvg_${r.slice(0,8)}`, admin_password: crypto.randomUUID().replace(/-/g,"").slice(0,16) };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

async function createWebsiteWithFallback(
  subdomain: string, siteTitle: string, region?: string
): Promise<{ website_id: string; region: string; raw?: any }> {
  const creds = generateCredentials();
  const base = { subdomain, site_title: siteTitle, ...creds };

  const zones = region && (ALLOWED_ZONES as readonly string[]).includes(region)
    ? [region, ...ALLOWED_ZONES.filter(z => z !== region)]
    : [...ALLOWED_ZONES];

  let lastErr: any = null;
  for (const z of zones) {
    try {
      const r = await createWebsite({ ...base, region: z });
      return { website_id: r.website_id, region: z, raw: r };
    } catch (e: any) {
      lastErr = e;
      if (e?.status === 400 || e?.status === 422) continue; // try next zone
      break; // non-retryable
    }
  }
  // final fallback to region str
  const r = await createWebsite({ ...base, region: FALLBACK_REGION }).catch(() => { throw lastErr; });
  return { website_id: r.website_id, region: FALLBACK_REGION, raw: r };
}

// ---- Database operations - single instance
const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function saveDraft(input: {
  website_id: string | number | null
  region: string
  slug: string
  brief: Record<string, unknown>
}) {
  const res = await fetch(`${SB_URL}/rest/v1/site_drafts`, {
    method: "POST",
    headers: {
      "apikey": SB_SVC,
      "authorization": `Bearer ${SB_SVC}`,
      "content-type": "application/json",
      "prefer": "return=representation",
    },
    body: JSON.stringify([{
      website_id: input.website_id ? Number(input.website_id) : Math.floor(Math.random() * 1000000),
      unique_id: input.website_id ? String(input.website_id) : "draft-" + Date.now(),
      subdomain: input.slug,
      brief: input.brief,
      pages_meta: [],
      colors: {},
      fonts: {},
    }]),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e: any = new Error("draft insert failed")
    e.status = res.status
    e.body = json
    throw e
  }
  return Array.isArray(json) ? json[0] : json
}

// ---- Handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") return err("Method not allowed", req, 405)

  let body: any = {}
  try { body = await req.json() } catch { return err("Invalid JSON", req, 400) }

  const action = String(body?.action ?? "")
  
  // Health check endpoint
  if (action === "ping") {
    return ok({ ok: true, message: "ai-router is healthy", timestamp: new Date().toISOString() }, req)
  }

  // GET DRAFT
  if (action === "get-draft") {
    const { draft_id } = body || {};
    if (!draft_id) return err("Missing draft_id", req, 400);
    const result = await getDraftRow(String(draft_id));
    if (!result.ok)      return err("Fetch failed", req, 500);
    if (!result.rows?.length) return err("Not found", req, 404);
    return ok({ ok:true, data: result.rows[0] }, req, 200);
  }

  // SAVE DRAFT
  if (action === "save-draft") {
    const { draft_id, pages_meta = [], colors = {}, fonts = {} } = body || {};
    if (!draft_id) return err("Missing draft_id", req, 400);

    // Optional: normalization happens client-side already, but keep defaults
    const patch = { pages_meta, colors, fonts, status: "draft" };
    const result = await updateDraft(String(draft_id), patch);
    if (!result.ok) return err("Update failed", req, 500);
    const row = Array.isArray(result.out) ? result.out[0] : result.out;
    return ok({ ok:true, data: row }, req, 200);
  }
  
  if (action !== "create-website" && action !== "create-draft") {
    return err("Invalid action. Supported actions: create-website, create-draft, get-draft, save-draft, ping", req, 400)
  }

  // PUBLIC onboarding: no auth required
  const brief = body?.brief ?? body
  
  const bt = brief?.business_type?.toString().trim();
  const bn = brief?.business_name?.toString().trim();
  const bd = brief?.business_description?.toString().trim();
  let sub = brief?.preferred_subdomain?.toString().trim();

  if (!bt || !bn || !bd) {
    return err(
      "Missing required fields",
      req,
      400
    );
  }

  // auto-generate subdomain if empty
  if (!sub) sub = slugify(bn);
  // enforce allowed chars/length
  sub = slugify(sub);
  if (!sub) sub = slugify(bn);

  // Fast path for draft creation - no 10Web API call needed
  if (action === "create-draft") {
    try {
      const region = "europe-west3-a" // Default region for drafts
      console.log("Creating draft with:", { website_id: null, region, slug: sub, brief: { business_type: bt, business_name: bn, business_description: bd } })
      
      const draftRow = await saveDraft({
        website_id: null,
        region,
        slug: sub,
        brief: {
          business_type: bt,
          business_name: bn,
          business_description: bd,
          preferred_subdomain: brief?.preferred_subdomain || null,
        },
      })
      
      console.log("Draft created:", draftRow)
      
      return ok({
        ok: true,
        draft_id: draftRow?.id,
        region,
        subdomain: sub,
      }, req)
    } catch (error) {
      console.error("Draft creation error:", error)
      return err("Draft creation failed: " + (error instanceof Error ? error.message : String(error)), req, 500)
    }
  }

  // Full website creation path - requires 10Web API
  try {
    const website = await createWebsiteWithFallback(sub, bn, brief?.region);
    
    // minimal draft shape; adjust fields if your table differs
    const draftRow = await saveDraft({
      website_id: website?.id ?? website?.website_id ?? "",
      region: website.region,
      slug: sub,
      brief: {
        business_type: bt,
        business_name: bn,
        business_description: bd,
        preferred_subdomain: brief?.preferred_subdomain || null,
      },
    })

    return ok({
      ok: true,
      draft_id: draftRow?.id,
      region: website.region,
      subdomain: sub,
      website_id: website?.id ?? website?.website_id ?? null,
    }, req)
  } catch (e: any) {
    // Log full error for debugging but don't leak secrets to client
    console.error("ai-router error:", e)
    
    // Return safe error message without sensitive details
    const safeMessage = e?.status === 400 || e?.status === 422 
      ? (e?.body?.message ?? "Invalid request")
      : "Service temporarily unavailable"
    
    return err(safeMessage, req, e?.status ?? 500)
  }
});