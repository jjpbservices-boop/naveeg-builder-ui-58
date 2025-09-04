const ALLOWED_ORIGINS = [
  'https://naveeg.app',
  'https://www.naveeg.app',
  'http://localhost:3000',
  'http://localhost:4311',
  'http://localhost:4312',
  'http://localhost:5173'
];

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be set dynamically based on request origin
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Vary': 'Origin'
};

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '') 
    ? origin 
    : 'https://naveeg.app';

  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowedOrigin
  };
}

export function handleCors(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(request) });
  }
  return null;
}