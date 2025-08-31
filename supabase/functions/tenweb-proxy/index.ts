// deno-lint-ignore-file no-explicit-any
const ORIGINS = new Set([
  "https://naveeg.app",
  "https://www.naveeg.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = ORIGINS.has(origin) ? origin : "https://naveeg.app";
  const acrh =
    req.headers.get("access-control-request-headers") ??
    "authorization, x-client-info, apikey, content-type, x-api-key";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": acrh,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

type CacheEntry = { status: number; body: string; ctype: string; ts: number };
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 90_000;               // fresh window
const STALE_GRACE_MS = 180_000;      // serve-stale-if-error window

// Coalesce bursts hitting same key
const INFLIGHT = new Map<string, Promise<{status:number; body:string; ctype:string; headers:Headers}>>();

const keyOf = (m: string, path: string, q: Record<string, unknown> | undefined) =>
  `${m}:${path}?${JSON.stringify(q ?? {})}`;

Deno.serve(async (req) => {
  const corsHeaders = cors(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { path, method = "GET", query, body } = await req.json();
    if (!path || typeof path !== "string") {
      return new Response(JSON.stringify({ error: "Missing path" }), {
        status: 400, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const TENWEB_API_KEY = Deno.env.get("TENWEB_API_KEY");
    if (!TENWEB_API_KEY) {
      return new Response(JSON.stringify({ error: "TENWEB_API_KEY not set" }), {
        status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const k = keyOf(method.toUpperCase(), path, query);
    const now = Date.now();
    const cached = CACHE.get(k);
    const hasFresh = !!(cached && now - cached.ts < TTL_MS);
    const hasStale = !!(cached && now - cached.ts < TTL_MS + STALE_GRACE_MS);

    if (method === "GET" && hasFresh) {
      return new Response(cached.body, {
        status: cached.status,
        headers: { ...corsHeaders, "content-type": cached.ctype, "x-tenweb-proxy-cache": "hit" },
      });
    }

    // Coalesce upstream fetches
    const fetchOnce = async () => {
      const url = new URL(`https://api.10web.io${path}`);
      Object.entries(query ?? {}).forEach(([k, v]) => url.searchParams.set(k, String(v)));

      const upstream = await fetch(url.toString(), {
        method,
        headers: {
          "x-api-key": TENWEB_API_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const ctype = upstream.headers.get("content-type") ?? "application/json";
      const txt = await upstream.text();
      return { status: upstream.status, body: txt, ctype, headers: upstream.headers };
    };

    if (!INFLIGHT.has(k)) INFLIGHT.set(k, fetchOnce().finally(() => INFLIGHT.delete(k)));
    const { status: upStatusRaw, body: upBody, ctype: upType, headers: upHeaders } = await INFLIGHT.get(k)!;

    // Detect Cloudflare HTML error pages and normalize to 429
    const looksLikeCfHtml = upType.includes("text/html") && /1015|rate\s*limited|cloudflare/i.test(upBody);
    const upStatus = looksLikeCfHtml && (upStatusRaw === 403 || upStatusRaw === 503) ? 429 : upStatusRaw;

    // Success => cache GET
    if (upStatus >= 200 && upStatus < 300) {
      if (method === "GET") CACHE.set(k, { status: upStatus, body: upBody, ctype: upType, ts: now });
      return new Response(upBody, {
        status: upStatus,
        headers: { ...corsHeaders, "content-type": upType, "x-tenweb-proxy-upstream-status": String(upStatusRaw) },
      });
    }

    // Error path: serve stale if we can (429/5xx/403 HTML etc.)
    const errorIsRateLike = upStatus === 429 || upStatus === 503 || looksLikeCfHtml;
    if (method === "GET" && hasStale && errorIsRateLike) {
      return new Response(cached!.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "content-type": cached!.ctype,
          "x-tenweb-proxy-stale": "true",
          "x-tenweb-proxy-upstream-status": String(upStatusRaw),
        },
      });
    }

    // Pass through, but ensure JSON for non-JSON errors so the client doesn't choke
    const retryAfter = upHeaders.get("retry-after") ?? "";
    const asJson = upType.includes("application/json");
    const body = asJson ? upBody : JSON.stringify({
      status: "error",
      message: looksLikeCfHtml ? "Too many requests (Cloudflare 1015)" : "Upstream error",
      upstream_status: upStatusRaw,
    });

    return new Response(body, {
      status: errorIsRateLike ? 429 : upStatus,
      headers: {
        ...corsHeaders,
        "content-type": "application/json",
        "x-tenweb-proxy-upstream-status": String(upStatusRaw),
        ...(retryAfter && { "retry-after": retryAfter }),
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});