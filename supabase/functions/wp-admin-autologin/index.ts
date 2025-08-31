import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createHandler } from '../_shared/handler.ts';
import { fetchJson } from '../_shared/http.ts';

const AutologinRequestSchema = z.object({
  website_id: z.string().uuid(),
});

const AutologinResponseSchema = z.object({
  admin_url: z.string().url(),
  token: z.string(),
});

async function handleAutologin({ input, user, logger }: any) {
  const { website_id } = input;
  const baseUrl = Deno.env.get('TENWEB_API_BASE') || 'https://api.10web.io';
  const apiKey = Deno.env.get('TENWEB_API_KEY');
  
  if (!apiKey) {
    throw new Error('TENWEB_API_KEY environment variable is required');
  }

  logger.step('Getting WordPress autologin for website', { website_id });

  // Create Supabase service client
  const supabaseService = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  // Get website from database
  const { data: website, error: websiteError } = await supabaseService
    .from('websites')
    .select('*')
    .eq('id', website_id)
    .eq('user_id', user.id)
    .single();

  if (websiteError || !website) {
    throw new Error('Website not found or access denied');
  }

  if (!website.tenweb_website_id) {
    throw new Error('Website does not have a 10Web ID');
  }

  const startTime = Date.now();

  try {
    // Call 10Web autologin endpoint
    const autologinData = await fetchJson(
      `${baseUrl}/v1/account/websites/${website.tenweb_website_id}/single?admin_url=1`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const duration = Date.now() - startTime;
    logger.step('Autologin token received', { duration });

    // Log API audit
    await supabaseService.from('api_audit').insert({
      user_id: user.id,
      website_id: website.id,
      service: '10web',
      endpoint: `/v1/account/websites/${website.tenweb_website_id}/single`,
      method: 'GET',
      status_code: 200,
      duration_ms: duration,
      request: { website_id },
      response: { has_token: !!autologinData.token },
    });

    // Log event
    await supabaseService.from('events').insert({
      user_id: user.id,
      website_id: website.id,
      type: 'wp_admin.access',
      payload: {
        tenweb_website_id: website.tenweb_website_id,
        access_method: 'autologin',
      },
    });

    return {
      admin_url: autologinData.admin_url || website.admin_url,
      token: autologinData.token,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log failed API audit
    await supabaseService.from('api_audit').insert({
      user_id: user.id,
      website_id: website.id,
      service: '10web',
      endpoint: `/v1/account/websites/${website.tenweb_website_id}/single`,
      method: 'GET',
      status_code: 500,
      duration_ms: duration,
      request: { website_id },
      response: { error: error.message },
    });

    logger.error('Autologin failed', error);
    throw error;
  }
}

serve(
  createHandler('wp-admin-autologin', handleAutologin, {
    requireAuth: true,
    inputSchema: AutologinRequestSchema,
    outputSchema: AutologinResponseSchema,
  })
);