import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import { createHandler } from '../_shared/handler.ts';
import { fetchJson } from '../_shared/http.ts';

const PsiRequestSchema = z.object({
  url: z.string().url(),
});

const PsiResponseSchema = z.object({
  url: z.string().url(),
  desktop_score: z.number().min(0).max(100),
  mobile_score: z.number().min(0).max(100),
  performance: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
  best_practices: z.number().min(0).max(100),
  seo: z.number().min(0).max(100),
  first_contentful_paint: z.number(),
  largest_contentful_paint: z.number(),
  time_to_interactive: z.number(),
  cumulative_layout_shift: z.number(),
  tested_at: z.string(),
});

async function handlePsiReport({ input, logger }: any) {
  const { url } = input;
  const apiKey = Deno.env.get('PSI_API_KEY');
  
  if (!apiKey) {
    throw new Error('PSI_API_KEY environment variable is required');
  }

  logger.step('Calling PageSpeed Insights API', { url });

  // Get both desktop and mobile scores
  const [desktopData, mobileData] = await Promise.all([
    fetchJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=desktop`),
    fetchJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile`)
  ]);

  logger.step('Processing PSI response');

  // Extract metrics from desktop data
  const desktopLighthouse = desktopData.lighthouseResult;
  const desktopCategories = desktopLighthouse.categories;
  const desktopAudits = desktopLighthouse.audits;

  // Extract metrics from mobile data
  const mobileLighthouse = mobileData.lighthouseResult;
  const mobileCategories = mobileLighthouse.categories;
  const mobileAudits = mobileLighthouse.audits;

  const metrics = {
    url,
    desktop_score: Math.round(desktopCategories.performance.score * 100),
    mobile_score: Math.round(mobileCategories.performance.score * 100),
    performance: Math.round(desktopCategories.performance.score * 100),
    accessibility: Math.round(desktopCategories.accessibility.score * 100),
    best_practices: Math.round(desktopCategories['best-practices'].score * 100),
    seo: Math.round(desktopCategories.seo.score * 100),
    first_contentful_paint: desktopAudits['first-contentful-paint'].numericValue,
    largest_contentful_paint: desktopAudits['largest-contentful-paint'].numericValue,
    time_to_interactive: desktopAudits['interactive'].numericValue,
    cumulative_layout_shift: desktopAudits['cumulative-layout-shift'].numericValue,
    tested_at: new Date().toISOString(),
  };

  logger.step('PSI report generated', { metrics });

  return metrics;
}

serve(
  createHandler('psi-report', handlePsiReport, {
    requireAuth: true,
    inputSchema: PsiRequestSchema,
    outputSchema: PsiResponseSchema,
  })
);