import { z } from 'zod';
import { invokeSupabaseFunction } from '@/lib/api/client';

// PSI Schemas
export const PsiMetricsSchema = z.object({
  performance_score: z.number().min(0).max(100),
  accessibility_score: z.number().min(0).max(100),
  best_practices_score: z.number().min(0).max(100),
  seo_score: z.number().min(0).max(100),
  first_contentful_paint: z.number().min(0),
  largest_contentful_paint: z.number().min(0),
  cumulative_layout_shift: z.number().min(0),
});

export const PsiReportSchema = z.object({
  url: z.string().url(),
  metrics: PsiMetricsSchema,
  tested_at: z.string(),
  report_id: z.string(),
});

export type PsiMetrics = z.infer<typeof PsiMetricsSchema>;
export type PsiReport = z.infer<typeof PsiReportSchema>;

export const PsiRequestSchema = z.object({
  url: z.string().url(),
});

export type PsiRequest = z.infer<typeof PsiRequestSchema>;

// PSI API client
export async function getPsiReport(url: string): Promise<PsiReport> {
  const request: PsiRequest = { url };
  
  return invokeSupabaseFunction('psi-report', request, PsiReportSchema);
}

// Mock data for development/testing
export const mockPsiReport: PsiReport = {
  url: 'https://example.com',
  metrics: {
    performance_score: 85,
    accessibility_score: 92,
    best_practices_score: 88,
    seo_score: 95,
    first_contentful_paint: 1200,
    largest_contentful_paint: 2300,
    cumulative_layout_shift: 0.12,
  },
  tested_at: new Date().toISOString(),
  report_id: 'mock-report-id',
};