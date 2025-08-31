import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import { createHandler } from '../_shared/handler.ts';
import { fetchJson } from '../_shared/http.ts';

const ProxyRequestSchema = z.object({
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
  body: z.any().optional(),
});

async function handleBuilderProxy({ input, user, logger }: any) {
  const { path, method, body } = input;
  const baseUrl = Deno.env.get('TENWEB_API_BASE') || 'https://api.10web.io';
  const apiKey = Deno.env.get('TENWEB_API_KEY');
  
  if (!apiKey) {
    throw new Error('TENWEB_API_KEY environment variable is required');
  }

  logger.step('Proxying request to 10Web API', { path, method });

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetchJson(`${baseUrl}${path}`, options);
  
  logger.step('10Web API response received');

  return response;
}

serve(
  createHandler('builder-proxy', handleBuilderProxy, {
    requireAuth: true,
    inputSchema: ProxyRequestSchema,
  })
);