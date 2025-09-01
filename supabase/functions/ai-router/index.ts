import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { isOriginAllowed, handlePreflight, json } from "../_shared/cors.ts";

// ---- 10Web API client - single instance
const TW_BASE = Deno.env.get("TENWEB_API_BASE") ?? "https://api.10web.io";
const TW_KEY  = Deno.env.get("TENWEB_API_KEY") ?? "";

async function createWebsite(payload: {
  subdomain: string; region: string; site_title: string;
  admin_username: string; admin_password: string;
}, timeoutMs = 25_000): Promise<{ website_id: string; [k: string]: unknown }> {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeoutMs);
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
  subdomain: string; region: string; brief: Record<string, unknown>;
  website_id?: string | null; status?: "created"|"queued"|"failed"; message?: string | null;
}) {
  const payload = {
    subdomain: input.subdomain,
    region: input.region,
    brief: input.brief,
    website_id: input.website_id ?? null,
    status: input.status ?? "created",
    message: input.message ?? null,
    pages_meta: [],
    colors: {},
    fonts: {},
  };
  const res = await fetch(`${SB_URL}/rest/v1/site_drafts`, {
    method: "POST",
    headers: { apikey: SB_SVC, authorization: `Bearer ${SB_SVC}`, "Content-Type": "application/json", prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const e: any = new Error("draft insert failed"); e.status = res.status; e.body = json; throw e; }
  return json; // expecting returned row with id
}

// ---- Handler
Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || req.headers.get("x-forwarded-origin");

  if (req.method === "OPTIONS") return handlePreflight(req);
  if (!isOriginAllowed(origin)) return json({ ok:false, message:"Origin not allowed" }, origin, 403);
  if (req.method !== "POST")   return json({ ok:false, message:"Method not allowed" }, origin, 405);

  try {
    const { action, brief } = await req.json();
    if (action !== "create-website") return json({ ok:false, message:"Invalid action" }, origin, 400);

    // validate brief
    const { business_type, business_name, business_description, preferred_subdomain, region } = brief ?? {};
    const ALLOWED = new Set(["service","restaurant","retail","ecommerce","beauty"]);
    if (!ALLOWED.has(business_type) || !business_name || !business_description)
      return json({ ok:false, message:"Invalid brief" }, origin, 422);

    const slug = String(preferred_subdomain || business_name)
      .toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,30) || "site";

    // attempt 10Web site creation
    let website_id: string | null = null; let zone = region as string | undefined; let status: "created"|"queued"|"failed" = "created"; let message: string | null = null;
    try {
      const r = await createWebsiteWithFallback(slug, business_name, zone);
      website_id = r.website_id; zone = r.region;
    } catch (e: any) {
      status = "queued"; message = e?.body?.message || e?.message || "TENWEB_ERROR";
    }

    const row = await saveDraft({ subdomain: slug, region: zone || "europe-west3", brief, website_id, status, message });
    return json({ ok:true, draft_id: row.id, region: row.region, subdomain: row.subdomain, website_id }, origin, 200);
  } catch (e: any) {
    return json({ ok:false, message:"Internal error" }, origin, 500);
  }
});