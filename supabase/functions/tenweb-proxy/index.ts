// supabase/functions/tenweb-proxy/index.ts
const ORIGINS = new Set([
  "https://naveeg.app",
  "https://www.naveeg.app",
  "http://localhost:5173",
  "http://localhost:3000",
  // add any preview domains you actually use
]);

function buildCors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowOrigin = ORIGINS.has(origin) ? origin : "https://naveeg.app";
  const acrh =
    req.headers.get("access-control-request-headers") ??
    "authorization, x-client-info, apikey, content-type, x-api-key";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": acrh,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

Deno.serve(async (req) => {
  const cors = buildCors(req);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const { path, method = "GET", query, body } = await req.json();
    
    console.log('[TENWEB_PROXY] Request details:', { 
      path, 
      method, 
      query, 
      body,
      hasApiKey: !!Deno.env.get("TENWEB_API_KEY")
    });

    const TENWEB_API_KEY = Deno.env.get("TENWEB_API_KEY");
    if (!TENWEB_API_KEY) {
      console.error('[TENWEB_PROXY] Missing TENWEB_API_KEY');
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const url = new URL(`https://api.10web.io${path}`);
    Object.entries(query ?? {}).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    );

    console.log('[TENWEB_PROXY] Calling TenWeb API:', url.toString());

    const upstream = await fetch(url, {
      method,
      headers: {
        "x-api-key": TENWEB_API_KEY,
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await upstream.text();
    
    console.log('[TENWEB_PROXY] TenWeb API response:', {
      status: upstream.status,
      statusText: upstream.statusText,
      responseLength: text.length,
      response: upstream.status >= 400 ? text : 'Success'
    });

    return new Response(text, {
      status: upstream.status,
      headers: {
        ...cors,
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (e) {
    console.error('[TENWEB_PROXY] Error:', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});