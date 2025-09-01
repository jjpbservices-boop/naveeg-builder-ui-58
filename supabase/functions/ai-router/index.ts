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

// ---- 10Web call helper
const TW_BASE = Deno.env.get("TENWEB_API_BASE") ?? "https://api.10web.io"
const TW_KEY  = Deno.env.get("TENWEB_API_KEY")  ?? ""

async function tw(path: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 25000)
  try {
    const res = await fetch(`${TW_BASE}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-api-key": TW_KEY,
        ...(init.headers || {}),
      },
      signal: ctrl.signal,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const e: any = new Error("10Web API error")
      e.status = res.status
      e.body = json
      throw e
    }
    return json
  } finally {
    clearTimeout(t)
  }
}

// ---- Frankfurt zones (fixed order)
const FR_ZONES = ["europe-west3-a", "europe-west3-b", "europe-west3-c"] as const
const FR_REGION = "europe-west3"

function buildHostingPayload(candidate: any, region: string) {
  return {
    unique_id: crypto.randomUUID(),
    subdomain: candidate.subdomain, // your sanitized slug
    region,
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 30);
}

// Try zones a→b→c then fall back to region
async function createInFrankfurt(candidate: any) {
  let lastError: any = null

  for (const zone of FR_ZONES) {
    try {
      const r = await tw("/v1/hosting/website", {
        method: "POST",
        body: JSON.stringify(buildHostingPayload(candidate, zone)),
        timeoutMs: 25000,
      })
      return { website: r?.data ?? r, region: zone }
    } catch (e: any) {
      if (e?.status === 400 || e?.status === 422) { lastError = e; continue }
      throw e
    }
  }

  // final fallback to regional string (not zone)
  const r2 = await tw("/v1/hosting/website", {
    method: "POST",
    body: JSON.stringify(buildHostingPayload(candidate, FR_REGION)),
    timeoutMs: 25000,
  })
  return { website: r2?.data ?? r2, region: FR_REGION }
}

// ---- DRAFT write (service role inside function; safe even with public caller)
const SB_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SB_SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

async function saveDraft(minDraft: {
  tenweb_website_id: string | number
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
      tenweb_website_id: String(minDraft.tenweb_website_id),
      region: minDraft.region,
      subdomain: minDraft.slug,
      brief: minDraft.brief,
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

  // PUBLIC onboarding: no auth required
  const brief = body?.brief ?? body
  
  const bt = brief?.business_type?.toString().trim();
  const bn = brief?.business_name?.toString().trim();
  const bd = brief?.business_description?.toString().trim();
  let sub = brief?.preferred_subdomain?.toString().trim();

  if (!bt || !bn || !bd) {
    return err(
      "Missing required fields",
      origin,
      400
    );
  }

  // auto-generate subdomain if empty
  if (!sub) sub = slugify(bn);
  // enforce allowed chars/length
  sub = slugify(sub);
  if (!sub) sub = slugify(bn);

  const candidate = { subdomain: sub }

  try {
    const { website, region } = await createInFrankfurt(candidate)

    // minimal draft shape; adjust fields if your table differs
    const draftRow = await saveDraft({
      tenweb_website_id: website?.id ?? website?.website_id ?? "",
      region,
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
      region,
      subdomain: sub,
      website_id: website?.id ?? website?.website_id ?? null,
    }, origin)
  } catch (e: any) {
    return err(e?.body?.message ?? e?.message ?? "Create failed", origin, e?.status ?? 500)
  }
})