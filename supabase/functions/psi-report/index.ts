import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createHandler } from '../_shared/handler.ts';
import { fetchJson } from '../_shared/http.ts';
import { fetchPsiReport, validateStrategy } from '../_shared/psi.ts';

const PsiRequestSchema = z.object({
  url: z.string().url(),
  strategy: z.enum(['mobile', 'desktop']).optional().default('mobile'),
});

const PsiResponseSchema = z.object({
  performance_score: z.number().min(0).max(100),
  strategy: z.enum(['mobile', 'desktop']),
  url: z.string(),
  created_at: z.string(),
});

async function handlePsiReport({ input, user, logger }: any) {
  const { url, strategy = 'mobile' } = input;
  
  // Health check endpoint
  if (url === 'ping') {
    return {
      performance_score: 100,
      strategy: 'mobile',
      url: 'ping',
      created_at: new Date().toISOString(),
    };
  }
  
  if (!validateStrategy(strategy)) {
    throw new Error('Invalid strategy. Must be "mobile" or "desktop"');
  }

  const startTime = Date.now();
  logger.step('Calling PageSpeed Insights API', { url, strategy });

  try {
    // Get PSI report using shared client
    const psiResult = await fetchPsiReport(url, strategy);

    const duration = Date.now() - startTime;
    logger.step('PSI API response received', { duration, score: psiResult.performance_score });

    // Create Supabase service client for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Find website_id if URL matches a known website
    const { data: website } = await supabaseService
      .from('websites')
      .select('id')
      .eq('site_url', url)
      .eq('user_id', user.id)
      .single();

    // Store PSI report in database
    const { data: report, error: reportError } = await supabaseService
      .from('site_perf')
      .insert({
        site_id: website?.id || null,
        strategy,
        performance_score: psiResult.performance_score,
        crux: psiResult.crux,
        lhr: psiResult.lhr,
      })
      .select()
      .single();

    if (reportError) {
      logger.error('Failed to store PSI report', reportError);
      throw new Error('Failed to store PSI report');
    }

    // Log API audit
    await supabaseService.from('api_audit').insert({
      user_id: user.id,
      website_id: website?.id || null,
      service: 'psi',
      endpoint: '/runPagespeed',
      method: 'GET',
      status_code: 200,
      duration_ms: duration,
      request: { url },
      response: { desktop_score: desktopScore, mobile_score: mobileScore },
    });

    logger.step('PSI report stored successfully', { reportId: report.id });

    return {
      performance_score: psiResult.performance_score,
      strategy,
      url,
      created_at: report.created_at,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log failed API audit
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    await supabaseService.from('api_audit').insert({
      user_id: user.id,
      service: 'psi',
      endpoint: '/runPagespeed',
      method: 'GET',
      status_code: 500,
      duration_ms: duration,
      request: { url },
      response: { error: error.message },
    });

    throw error;
  }
}

serve(
  createHandler('psi-report', handlePsiReport, {
    requireAuth: true,
    inputSchema: PsiRequestSchema,
    outputSchema: PsiResponseSchema,
  })
);