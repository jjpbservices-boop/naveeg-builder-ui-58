const PSI_API_KEY = Deno.env.get('PSI_API_KEY');
const PSI_BASE_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

if (!PSI_API_KEY) {
  throw new Error('PSI_API_KEY environment variable is required');
}

export interface PSIMetrics {
  performance: number;
  seo: number;
  accessibility: number;
  best_practices: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  inp: number; // Interaction to Next Paint
  tbt: number; // Total Blocking Time
  cls: number; // Cumulative Layout Shift
  timestamp: string;
}

class PSIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMetrics(url: string, strategy: 'mobile' | 'desktop'): Promise<PSIMetrics> {
    try {
      const params = new URLSearchParams({
        url,
        key: this.apiKey,
        strategy,
        category: 'PERFORMANCE',
        category: 'SEO',
        category: 'ACCESSIBILITY',
        category: 'BEST_PRACTICES'
      });

      const response = await fetch(`${PSI_BASE_URL}?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PSI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Extract metrics from PSI response
      const lighthouse = data.lighthouseResult;
      const audits = lighthouse.audits;
      
      return {
        performance: Math.round(lighthouse.categories.performance.score * 100),
        seo: Math.round(lighthouse.categories.seo.score * 100),
        accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
        best_practices: Math.round(lighthouse.categories['best-practices'].score * 100),
        fcp: this.getMetricValue(audits['first-contentful-paint']),
        lcp: this.getMetricValue(audits['largest-contentful-paint']),
        inp: this.getMetricValue(audits['max-potential-fid']) || this.getMetricValue(audits['interactive']),
        tbt: this.getMetricValue(audits['total-blocking-time']),
        cls: this.getMetricValue(audits['cumulative-layout-shift']),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('PSI API error:', error);
      throw new Error(`Failed to get PSI metrics: ${error.message}`);
    }
  }

  private getMetricValue(audit: any): number {
    if (!audit || !audit.numericValue) return 0;
    
    // Convert milliseconds to seconds for time-based metrics
    if (audit.id.includes('paint') || audit.id.includes('blocking') || audit.id.includes('interactive')) {
      return Math.round(audit.numericValue / 1000 * 100) / 100;
    }
    
    return Math.round(audit.numericValue * 100) / 100;
  }
}

export const psiClient = new PSIClient(PSI_API_KEY);