// deno-lint-ignore-file no-explicit-any
export function getAllowedOrigins(): string[] {
  const raw = Deno.env.get("FRONTEND_ORIGINS") ?? "";
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin) || allowed.includes("*");
}
export function buildCorsHeaders(origin: string | null) {
  const allow = isOriginAllowed(origin) ? origin! : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type,x-client-info,apikey",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}
export function handlePreflight(req: Request) {
  const origin = req.headers.get("origin") || req.headers.get("x-forwarded-origin");
  if (!isOriginAllowed(origin)) return new Response(null, { status: 403, headers: { "Content-Type": "text/plain" } });
  return new Response(null, { status: 200, headers: buildCorsHeaders(origin) });
}
export function json(data: any, origin: string | null, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...buildCorsHeaders(origin) }});
}