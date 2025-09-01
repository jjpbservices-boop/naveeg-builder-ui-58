// CORS utilities for edge functions
export function getAllowedOrigins(): string[] {
  return (Deno.env.get("FRONTEND_ORIGINS") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin) || allowed.includes("*");
}

export function getAllowedOrigin(origin: string | null): string {
  return origin && isOriginAllowed(origin) ? origin : "*";
}

export function buildCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type,x-client-info,apikey",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function handlePreflight(req: Request) {
  const origin = req.headers.get("origin") || req.headers.get("x-forwarded-origin");
  
  if (!isOriginAllowed(origin)) {
    return new Response(null, { 
      status: 403,
      headers: { "Content-Type": "text/plain" }
    });
  }

  return new Response(null, { 
    status: 200, 
    headers: buildCorsHeaders(origin) 
  });
}