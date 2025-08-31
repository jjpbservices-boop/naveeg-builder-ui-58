import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createHandler } from '../_shared/handler.ts';
import { fetchJson } from '../_shared/http.ts';

const PsiRequestSchema = z.object({
  url: z.string().url(),
});

const PsiResponseSchema = z.object({
  desktop_score: z.number().min(0).max(100),
  mobile_score: z.number().min(0).max(100),
  desktop_tti: z.number(),
  mobile_tti: z.number(),
  url: z.string(),
  created_at: z.string(),
});

async function handlePsiReport({ input, user, logger }: any) {
  const { url } = input;
  const apiKey = Deno.env.get('PSI_API_KEY');
  
  if (!apiKey) {
    throw new Error('PSI_API_KEY environment variable is required');
  }

  const startTime = Date.now();
  logger.step('Calling PageSpeed Insights API', { url });

  try {
    // Get both desktop and mobile scores
    const [desktopData, mobileData] = await Promise.all([
      fetchJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&strategy=desktop`),
      fetchJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&strategy=mobile`)
    ]);

    const duration = Date.now() - startTime;
    logger.step('PSI API responses received', { duration });

    // Extract scores and TTI
    const desktopScore = Math.round((desktopData.lighthouseResult?.categories?.performance?.score || 0) * 100);
    const mobileScore = Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100);
    
    const desktopTTI = desktopData.lighthouseResult?.audits?.['interactive']?.numericValue || 0;
    const mobileTTI = mobileData.lighthouseResult?.audits?.['interactive']?.numericValue || 0;

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
      .from('psi_reports')
      .insert({
        user_id: user.id,
        website_id: website?.id || null,
        url,
        desktop_score: desktopScore,
        mobile_score: mobileScore,
        desktop_tti: desktopTTI,
        mobile_tti: mobileTTI,
        raw: {
          desktop: desktopData,
          mobile: mobileData,
        },
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
      desktop_score: desktopScore,
      mobile_score: mobileScore,
      desktop_tti: desktopTTI,
      mobile_tti: mobileTTI,
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