// deno-lint-ignore-file no-explicit-any
// Robust CORS + preflight + rate-limit handling + cache/coalescing.

function allowedOrigin(origin: string | null): string {
  if (!origin) return "https://naveeg.app";
  // allow app + any subdomain of naveeg.app and localhost
  try {
    const u = new URL(origin);
    if (u.hostname === "naveeg.app" || u.hostname.endsWith(".naveeg.app")) return origin;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return origin;
  } catch {}
  return "https://naveeg.app";
}

function buildCors(req: Request) {
  const origin = allowedOrigin(req.headers.get("origin"));
  const reqHdrs = req.headers.get("access-control-request-headers") ??
    "authorization, x-client-info, apikey, content-type, x-api-key";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": reqHdrs,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers": "retry-after, x-tenweb-proxy-error, x-tenweb-proxy-cache, x-tenweb-proxy-stale",
    "Vary": "Origin, Access-Control-Request-Headers",
  };
}

// ---- tiny cache + coalescing ----
type Entry = { status: number; body: string; type: string; ts: number; upstream?: number; retryAfter?: string };
const CACHE = new Map<string, Entry>();
const INFLIGHT = new Map<string, Promise<Entry>>();
const TTL_MS = 90_000;
const STALE_MS = 180_000;
const keyOf = (m: string, p: string, q?: Record<string, unknown>) => `${m}:${p}?${JSON.stringify(q ?? {})}`;

Deno.serve(async (req) => {
  const cors = buildCors(req);

  // Preflight must ALWAYS return 2xx, fast.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: cors });
  }

  try {
    const { path, method = "GET", query, body } = await req.json();
    if (!path || typeof path !== "string") {
      return new Response(JSON.stringify({ error: "Missing path" }), {
        status: 400, headers: { ...cors, "content-type": "application/json" },
      });
    }

    const TENWEB_API_KEY = Deno.env.get("TENWEB_API_KEY");
    if (!TENWEB_API_KEY) {
      return new Response(JSON.stringify({ error: "TENWEB_API_KEY not set" }), {
        status: 500, headers: { ...cors, "content-type": "application/json" },
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
        headers: { ...cors, "content-type": cached!.type, "x-tenweb-proxy-cache": "hit" },
      });
    }

    const doFetch = async (): Promise<Entry> => {
      const url = new URL(`https://api.10web.io${path}`);
      Object.entries(query ?? {}).forEach(([k2, v]) => url.searchParams.set(k2, String(v)));
      const up = await fetch(url.toString(), {
        method,
        headers: {
          "x-api-key": TENWEB_API_KEY,
          "accept": "application/json",
          "content-type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const type = up.headers.get("content-type") ?? "application/json";
      const txt = await up.text();
      const html1015 = type.includes("text/html") && /1015|rate\s*limited|cloudflare/i.test(txt);
      const status = html1015 && (up.status === 403 || up.status === 503) ? 429 : up.status;

      return { status, body: txt, type, ts: Date.now(), upstream: up.status, retryAfter: up.headers.get("retry-after") ?? undefined };
    };

    if (!INFLIGHT.has(k)) INFLIGHT.set(k, doFetch().finally(() => INFLIGHT.delete(k)));
    const res = await INFLIGHT.get(k)!;

    if (res.status >= 200 && res.status < 300 && method === "GET") CACHE.set(k, res);

    const rateLike = res.status === 429 || res.status === 503 || (res.type.includes("text/html") && /cloudflare/i.test(res.body));
    if (method === "GET" && stale && rateLike) {
      return new Response(cached!.body, {
        status: 200,
        headers: { ...cors, "content-type": cached!.type, "x-tenweb-proxy-stale": "true" },
      });
    }

    const retryAfter = res.retryAfter ?? "60";
    const headers: Record<string, string> = { ...cors, "content-type": "application/json" };
    if (rateLike) {
      headers["x-tenweb-proxy-error"] = "rate_limited";
      headers["retry-after"] = retryAfter;
    }

    const bodyOut = res.type.includes("application/json")
      ? res.body
      : JSON.stringify({
          status: "error",
          code: rateLike ? "rate_limited" : "upstream_error",
          message: rateLike ? "Too many requests (Cloudflare 1015)" : "Upstream error",
          retry_after: Number(retryAfter),
          upstream_status: res.upstream,
        });

    return new Response(bodyOut, { status: res.status, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...buildCors(req), "content-type": "application/json" },
    });
  }
});