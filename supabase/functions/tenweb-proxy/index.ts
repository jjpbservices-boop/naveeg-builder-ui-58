// deno-lint-ignore-file no-explicit-any
const ALLOWED_ORIGINS = new Set([
  "https://naveeg.app",
  "https://www.naveeg.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://naveeg.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-api-key",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { path, method = "GET", query, body } = await req.json();
    if (!path) return new Response(JSON.stringify({ error: "Missing path" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" },
    });

    const TENWEB_API_KEY = Deno.env.get("TENWEB_API_KEY");
    if (!TENWEB_API_KEY) return new Response(JSON.stringify({ error: "TENWEB_API_KEY not set" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });

    const url = new URL(`https://api.10web.io${path}`);
    Object.entries(query ?? {}).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const upstream = await fetch(url.toString(), {
      method,
      headers: { "x-api-key": TENWEB_API_KEY, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});