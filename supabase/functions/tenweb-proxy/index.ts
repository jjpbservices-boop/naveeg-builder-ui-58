// supabase/functions/tenweb-proxy/index.ts
// deno-lint-ignore-file no-explicit-any
const ALLOWED_ORIGINS = new Set([
  "https://naveeg.app",
  "https://www.naveeg.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://naveeg.app";
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

// in-memory cache + coalescing
type Entry = { status: number; body: string; type: string; ts: number };
const CACHE = new Map<string, Entry>();
const INFLIGHT = new Map<string, Promise<Entry>>();
const TTL_MS = 90_000;       // fresh for 90s
const STALE_MS = 180_000;    // serve-stale-if-error grace

const keyOf = (method: string, path: string, q?: Record<string, unknown>) =>
  `${method}:${path}?${JSON.stringify(q ?? {})}`;

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

    const k = keyOf(method, path, query);
    const now = Date.now();
    const cached = CACHE.get(k);
    const fresh = cached && now - cached.ts < TTL_MS;
    const stale = cached && now - cached.ts < TTL_MS + STALE_MS;

    if (method === "GET" && fresh) {
      return new Response(cached!.body, {
        status: cached!.status,
        headers: { ...corsHeaders, "content-type": cached!.type, "x-tenweb-proxy-cache": "hit" },
      });
    }

    const doFetch = async (): Promise<Entry> => {
      const url = new URL(`https://api.10web.io${path}`);
      Object.entries(query ?? {}).forEach(([k2, v]) => url.searchParams.set(k2, String(v)));

      const up = await fetch(url.toString(), {
        method,
        headers: {
          "x-api-key": TENWEB_API_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const type = up.headers.get("content-type") ?? "application/json";
      const txt = await up.text();
      // Normalize Cloudflare HTML rate-limit pages to 429
      const html1015 = type.includes("text/html") && /1015|rate\s*limited|cloudflare/i.test(txt);
      const status = html1015 && (up.status === 403 || up.status === 503) ? 429 : up.status;

      return { status, body: txt, type, ts: Date.now() };
    };

    if (!INFLIGHT.has(k)) INFLIGHT.set(k, doFetch().finally(() => INFLIGHT.delete(k)));
    const res = await INFLIGHT.get(k)!;

    if (res.status >= 200 && res.status < 300 && method === "GET") {
      CACHE.set(k, res);
    }

    const rateLike = res.status === 429 || res.status === 503 || (res.type.includes("text/html") && /cloudflare/i.test(res.body));
    if (method === "GET" && stale && rateLike) {
      return new Response(cached!.body, {
        status: 200,
        headers: { ...corsHeaders, "content-type": cached!.type, "x-tenweb-proxy-stale": "true" },
      });
    }

    const passBody = res.type.includes("application/json")
      ? res.body
      : JSON.stringify({ status: "error", message: rateLike ? "Too many requests (Cloudflare 1015)" : "Upstream error" });

    return new Response(passBody, {
      status: res.status,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});