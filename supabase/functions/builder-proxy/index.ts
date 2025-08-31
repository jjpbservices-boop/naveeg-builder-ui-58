import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createHandler } from '../_shared/handler.ts';
import { fetchWithTimeout } from '../_shared/http.ts';

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

  const startTime = Date.now();
  logger.step('Proxying request to 10Web API', { path, method });

  // Create Supabase service client for audit logging
  const supabaseService = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Naveeg-DMS/1.0',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetchWithTimeout(`${baseUrl}${path}`, options, 30000);
    const duration = Date.now() - startTime;
    
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Log successful API call
    await supabaseService.from('api_audit').insert({
      user_id: user.id,
      service: '10web',
      endpoint: path,
      method: method,
      status_code: response.status,
      duration_ms: duration,
      request: body || {},
      response: responseData,
    });

    logger.step('10Web API response received', { 
      status: response.status, 
      duration 
    });

    if (!response.ok) {
      throw new Error(`10Web API error: ${response.status} ${response.statusText}`);
    }

    return responseData;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log failed API call
    await supabaseService.from('api_audit').insert({
      user_id: user.id,
      service: '10web',
      endpoint: path,
      method: method,
      status_code: 500,
      duration_ms: duration,
      request: body || {},
      response: { error: errorMessage },
    });

    logger.error('10Web API error', { error: errorMessage, duration });
    throw error;
  }
}

serve(
  createHandler('builder-proxy', handleBuilderProxy, {
    requireAuth: true,
    inputSchema: ProxyRequestSchema,
  })
);