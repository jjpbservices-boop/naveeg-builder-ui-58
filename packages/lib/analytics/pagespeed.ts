export interface PSIMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  cls: number;
  tti: number;
  tbt: number;
  fcp: number;
}

export interface PSIAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
}

export interface PSIResult {
  url: string;
  strategy: 'mobile' | 'desktop';
  metrics: PSIMetrics;
  audits: PSIAudit[];
  raw: any;
  timestamp: string;
}

export class PageSpeedInsightsAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async runAudit(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PSIResult> {
    const params = new URLSearchParams({
      url: url,
      strategy: strategy,
      category: ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'].join(','),
      key: this.apiKey,
    });

    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`PageSpeed Insights API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return this.parsePSIResponse(url, strategy, data);
  }

  private parsePSIResponse(url: string, strategy: 'mobile' | 'desktop', data: any): PSIResult {
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories;
    const audits = lighthouse.audits;

    // Extract core web vitals and other metrics
    const metrics: PSIMetrics = {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      lcp: this.extractMetricValue(audits['largest-contentful-paint']),
      cls: this.extractMetricValue(audits['cumulative-layout-shift']),
      tti: this.extractMetricValue(audits['interactive']),
      tbt: this.extractMetricValue(audits['total-blocking-time']),
      fcp: this.extractMetricValue(audits['first-contentful-paint']),
    };

    // Extract key audits
    const keyAudits: PSIAudit[] = [
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'interactive',
      'total-blocking-time',
      'first-contentful-paint',
      'uses-optimized-images',
      'uses-webp-images',
      'unused-css-rules',
      'unused-javascript',
      'render-blocking-resources',
    ].map(id => ({
      id,
      title: audits[id]?.title || id,
      description: audits[id]?.description || '',
      score: audits[id]?.score,
      displayValue: audits[id]?.displayValue,
    }));

    return {
      url,
      strategy,
      metrics,
      audits: keyAudits,
      raw: data,
      timestamp: new Date().toISOString(),
    };
  }

  private extractMetricValue(audit: any): number {
    if (!audit || !audit.numericValue) return 0;
    
    // Convert to appropriate units (ms for time, score for others)
    if (audit.id.includes('paint') || audit.id.includes('interactive') || audit.id.includes('blocking')) {
      return Math.round(audit.numericValue / 1000); // Convert to seconds
    }
    
    return Math.round(audit.numericValue * 1000) / 1000; // Keep 3 decimal places
  }
}

export async function runPSIAudit(
  url: string, 
  strategy: 'mobile' | 'desktop' = 'mobile',
  apiKey: string
): Promise<PSIResult> {
  const psi = new PageSpeedInsightsAPI(apiKey);
  return psi.runAudit(url, strategy);
}
