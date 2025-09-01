// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const ORIGINS = (Deno.env.get("FRONTEND_ORIGINS") ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean)

const ok = (data: any, origin: string | null, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": allowOrigin(origin),
      "access-control-allow-methods": "POST,OPTIONS",
      "access-control-allow-headers": "authorization,content-type",
      "vary": "origin",
    },
  })

const err = (message: string, origin: string | null, status = 400) =>
  ok({ ok: false, message }, origin, status)

const allowOrigin = (origin: string | null) =>
  origin && ORIGINS.includes(origin) ? origin : "*"

const isAllowedOrigin = (origin: string | null) => {
  if (!origin) return false
  return ORIGINS.includes(origin) || ORIGINS.includes("*")
}

// ---- 10Web API client - official endpoint compliance
const TW_BASE = Deno.env.get("TENWEB_API_BASE") ?? "https://api.10web.io"
const TW_KEY = Deno.env.get("TENWEB_API_KEY") ?? ""

async function createWebsite(payload: {
  subdomain: string;
  region: string;
  site_title: string;
  admin_username: string;
  admin_password: string;
}, timeoutMs = 25000): Promise<{ website_id: string; [key: string]: any }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  
  try {
    const response = await fetch(`${TW_BASE}/websites`, {
      method: "POST",
      headers: {
        "x-api-key": TW_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })

    const data = await response.json().catch(() => ({}))
    
    if (!response.ok) {
      const error: any = new Error("10Web API error")
      error.status = response.status
      error.body = data
      error.code = "TENWEB_ERROR"
      error.details = { http: response.status }
      throw error
    }

    // Return website_id from response
    return {
      website_id: data.website_id || data.id || "",
      ...data
    }
  } finally {
    clearTimeout(timer)
  }
}

// ---- Region handling for Frankfurt zones
const ALLOWED_ZONES = ["europe-west3-a", "europe-west3-b", "europe-west3-c"] as const
const FALLBACK_REGION = "europe-west3"

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/--+/g, "-") // collapse double hyphens
    .slice(0, 30);
}

function generateCredentials() {
  return {
    admin_username: `admin_${crypto.randomUUID().substring(0, 8)}`,
    admin_password: crypto.randomUUID()
  }
}

async function createWebsiteWithFallback(
  subdomain: string, 
  businessName: string,
  region?: string
): Promise<{ website_id: string; region: string; raw?: any }> {
  const credentials = generateCredentials()
  const basePayload = {
    subdomain,
    site_title: businessName,
    ...credentials
  }

  // Try specified region first, then fallback zones
  const regionsToTry = region && ALLOWED_ZONES.includes(region as any) 
    ? [region, ...ALLOWED_ZONES.filter(z => z !== region)]
    : [...ALLOWED_ZONES]

  let lastError: any = null

  for (const targetRegion of regionsToTry) {
    try {
      const result = await createWebsite({
        ...basePayload,
        region: targetRegion
      })
      return { 
        website_id: result.website_id,
        region: targetRegion,
        raw: result
      }
    } catch (error: any) {
      lastError = error
      if (error?.status === 400 || error?.status === 422) {
        continue // Try next zone
      }
      break // Non-retryable error
    }
  }

  // Final fallback to region string
  try {
    const result = await createWebsite({
      ...basePayload,
      region: FALLBACK_REGION
    })
    return {
      website_id: result.website_id,
      region: FALLBACK_REGION,
      raw: result
    }
  } catch (error: any) {
    // If this fails too, throw the last meaningful error
    throw lastError || error
  }
}

// ---- Database operations
const SB_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SB_SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

async function saveDraft(draft: {
  subdomain: string;
  region: string;
  brief: Record<string, unknown>;
  website_id?: string;
  status?: string;
  message?: string;
}) {
  const payload = {
    subdomain: draft.subdomain,
    region: draft.region,
    brief: draft.brief,
    website_id: draft.website_id || null,
    status: draft.status || 'created',
    message: draft.message || null,
    pages_meta: [],
    colors: {},
    fonts: {},
  }

  const response = await fetch(`${SB_URL}/rest/v1/site_drafts`, {
    method: "POST",
    headers: {
      "apikey": SB_SVC,
      "authorization": `Bearer ${SB_SVC}`,
      "content-type": "application/json",
      "prefer": "return=representation",
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  
  if (!response.ok) {
    const error: any = new Error("Database insert failed")
    error.status = response.status
    error.body = data
    throw error
  }

  return data
}

// ---- Handler
Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  if (!isAllowedOrigin(origin)) {
    return err("Origin not allowed", origin, 400);
  }

  if (req.method === "OPTIONS") return ok({ ok: true }, origin)

  if (req.method !== "POST") return err("Method not allowed", origin, 405)

  let body: any = {}
  try { body = await req.json() } catch { return err("Invalid JSON", origin, 400) }

  const action = String(body?.action ?? "")
  if (action !== "create-website") {
    return err("Invalid action", origin, 400)
  }

  // Extract and validate brief data
  const brief = body?.brief ?? body
  
  const businessType = brief?.business_type?.toString().trim();
  const businessName = brief?.business_name?.toString().trim();
  const businessDescription = brief?.business_description?.toString().trim();
  let subdomain = brief?.preferred_subdomain?.toString().trim();

  if (!businessType || !businessName || !businessDescription) {
    return err("Missing required fields: business_type, business_name, business_description", origin, 400);
  }

  // Generate subdomain if empty
  if (!subdomain) subdomain = slugify(businessName);
  // Sanitize subdomain
  subdomain = slugify(subdomain);
  if (!subdomain) subdomain = slugify(businessName);

  const briefData = {
    business_type: businessType,
    business_name: businessName,
    business_description: businessDescription,
    preferred_subdomain: brief?.preferred_subdomain || null,
  }

  try {
    // Attempt to create website with 10Web
    const { website_id, region } = await createWebsiteWithFallback(
      subdomain, 
      businessName,
      brief?.region
    )

    // Save successful draft
    const draftRow = await saveDraft({
      subdomain,
      region,
      brief: briefData,
      website_id,
      status: 'created',
    })

    return ok({
      ok: true,
      draft_id: draftRow?.id,
      region,
      subdomain,
      website_id,
    }, origin)

  } catch (error: any) {
    console.error("AI Router Error:", error)
    
    // Save failed draft with error details
    try {
      const draftRow = await saveDraft({
        subdomain,
        region: 'europe-west3',
        brief: briefData,
        website_id: null,
        status: 'failed',
        message: error?.body?.message || error?.message || "10Web API failed",
      })

      // Return error response but with draft_id for tracking
      return ok({
        ok: false,
        code: "TENWEB_ERROR",
        message: error?.body?.message || error?.message || "Website creation failed",
        details: { http: error?.status || 500 },
        draft_id: draftRow?.id,
        subdomain,
      }, origin, error?.status || 500)
      
    } catch (dbError: any) {
      console.error("Failed to save error draft:", dbError)
      return err("Creation failed and could not save draft", origin, 500)
    }
  }
})