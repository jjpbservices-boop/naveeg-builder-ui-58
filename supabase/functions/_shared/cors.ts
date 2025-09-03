const ALLOWED_ORIGINS = new Set([
  "https://naveeg.online",
  "https://www.naveeg.online",
  "https://naveeg.app",
  "https://www.naveeg.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4311", // Marketing app
  "http://localhost:4312", // Dashboard app
]);

function isVercelPreview(origin: string) {
  try { 
    return new URL(origin).hostname.endsWith(".vercel.app"); 
  } catch { 
    return false; 
  }
}

export const corsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowOrigin = ALLOWED_ORIGINS.has(origin) || isVercelPreview(origin)
    ? origin
    : "https://naveeg.online";

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(req),
    });
  }
  return null;
};