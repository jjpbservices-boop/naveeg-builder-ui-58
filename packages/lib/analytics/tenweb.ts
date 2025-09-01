export interface TenWebMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  cls: number;
  tti: number;
  fcp: number;
}

export interface TenWebResult {
  url: string;
  metrics: TenWebMetrics;
  raw: any;
  timestamp: string;
}

export class TenWebAPI {
  private apiBase: string;
  private apiKey: string;

  constructor(apiBase: string, apiKey: string) {
    this.apiBase = apiBase;
    this.apiKey = apiKey;
  }

  async runAudit(url: string): Promise<TenWebResult> {
    const response = await fetch(`${this.apiBase}/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        strategy: 'mobile', // TenWeb default strategy
        categories: ['performance', 'accessibility', 'best-practices', 'seo'],
      }),
    });

    if (!response.ok) {
      throw new Error(`TenWeb API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return this.parseTenWebResponse(url, data);
  }

  private parseTenWebResponse(url: string, data: any): TenWebResult {
    // Parse TenWeb response format (adjust based on actual API response)
    const metrics: TenWebMetrics = {
      performance: Math.round((data.performance?.score || 0) * 100),
      accessibility: Math.round((data.accessibility?.score || 0) * 100),
      bestPractices: Math.round((data['best-practices']?.score || 0) * 100),
      seo: Math.round((data.seo?.score || 0) * 100),
      lcp: data.metrics?.lcp || 0,
      cls: data.metrics?.cls || 0,
      tti: data.metrics?.tti || 0,
      fcp: data.metrics?.fcp || 0,
    };

    return {
      url,
      metrics,
      raw: data,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function runTenWebAudit(
  url: string,
  apiBase: string,
  apiKey: string
): Promise<TenWebResult> {
  const tenweb = new TenWebAPI(apiBase, apiKey);
  return tenweb.runAudit(url);
}

// Feature flag check
export function isTenWebEnabled(): boolean {
  return !!(process.env.TENWEB_API_BASE && process.env.TENWEB_API_KEY);
}
