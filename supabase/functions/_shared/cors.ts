const ALLOWED_ORIGINS = new Set([
  'https://naveeg.app',
  'https://www.naveeg.app',
  'http://localhost:5173',
  'http://localhost:3000',
]);

export const corsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) 
    ? origin 
    : 'https://naveeg.app';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
};

export const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(req),
    });
  }
  return null;
};