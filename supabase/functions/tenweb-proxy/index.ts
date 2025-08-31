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

// Simple per-instance cache (best-effort, reduces bursts)
type CacheEntry = { status: number; body: string; ctype: string; ts: number };
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 90_000; // 90s cache to survive Cloudflare limits

function cacheKey(path: string, query: Record<string, unknown> | undefined) {
  return `${path}?${JSON.stringify(query ?? {})}`;
}

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

    const key = cacheKey(path, query);
    const now = Date.now();
    const cached = CACHE.get(key);
    if (cached && now - cached.ts < TTL_MS) {
      return new Response(cached.body, {
        status: cached.status,
        headers: { ...corsHeaders, "content-type": cached.ctype },
      });
    }

    const url = new URL(`https://api.10web.io${path}`);
    Object.entries(query ?? {}).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const upstream = await fetch(url.toString(), {
      method,
      headers: {
        "x-api-key": TENWEB_API_KEY,
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const ctype = upstream.headers.get("content-type") ?? "application/json";
    const text = await upstream.text();

    // On success, cache
    if (upstream.status >= 200 && upstream.status < 300) {
      CACHE.set(key, { status: upstream.status, body: text, ctype, ts: now });
    }

    // On 429 from 10Web, try serve stale cache if available
    if (upstream.status === 429 && cached) {
      return new Response(cached.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "content-type": cached.ctype,
          "x-tenweb-proxy-stale": "true",
        },
      });
    }

    // Pass through
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "content-type": ctype,
        "x-tenweb-proxy-upstream-status": String(upstream.status),
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});