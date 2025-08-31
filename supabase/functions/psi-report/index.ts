import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import { createHandler } from '../_shared/handler.ts';
import { fetchJson } from '../_shared/http.ts';

const PsiRequestSchema = z.object({
  url: z.string().url(),
});

const PsiResponseSchema = z.object({
  url: z.string().url(),
  metrics: z.object({
    performance_score: z.number().min(0).max(100),
    accessibility_score: z.number().min(0).max(100),
    best_practices_score: z.number().min(0).max(100),
    seo_score: z.number().min(0).max(100),
    first_contentful_paint: z.number().min(0),
    largest_contentful_paint: z.number().min(0),
    cumulative_layout_shift: z.number().min(0),
  }),
  tested_at: z.string(),
  report_id: z.string(),
});

async function handlePsiReport({ input, logger }: any) {
  const { url } = input;
  const apiKey = Deno.env.get('PSI_API_KEY');
  
  if (!apiKey) {
    throw new Error('PSI_API_KEY environment variable is required');
  }

  logger.step('Calling PageSpeed Insights API', { url });

  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo`;
  
  const psiResponse = await fetchJson(psiUrl);

  logger.step('Processing PSI response');

  // Extract metrics from PSI response
  const lighthouseResult = psiResponse.lighthouseResult;
  const categories = lighthouseResult.categories;
  const audits = lighthouseResult.audits;

  const metrics = {
    performance_score: Math.round(categories.performance.score * 100),
    accessibility_score: Math.round(categories.accessibility.score * 100),
    best_practices_score: Math.round(categories['best-practices'].score * 100),
    seo_score: Math.round(categories.seo.score * 100),
    first_contentful_paint: audits['first-contentful-paint'].numericValue,
    largest_contentful_paint: audits['largest-contentful-paint'].numericValue,
    cumulative_layout_shift: audits['cumulative-layout-shift'].numericValue,
  };

  logger.step('PSI report generated', { metrics });

  return {
    url,
    metrics,
    tested_at: new Date().toISOString(),
    report_id: crypto.randomUUID(),
  };
}

serve(
  createHandler('psi-report', handlePsiReport, {
    requireAuth: true,
    inputSchema: PsiRequestSchema,
    outputSchema: PsiResponseSchema,
  })
);