// PSI API utility for PageSpeed Insights v5 compliance
export interface PSIRequest {
  url: string;
  strategy?: 'mobile' | 'desktop';
  locale?: string;
  categories?: ('PERFORMANCE' | 'ACCESSIBILITY' | 'BEST_PRACTICES' | 'SEO')[];
}

export interface PSIResponse {
  lighthouseResult: {
    categories: {
      performance?: { score: number };
      accessibility?: { score: number };
      'best-practices'?: { score: number };
      seo?: { score: number };
    };
    audits: Record<string, any>;
  };
  loadingExperience?: {
    metrics: Record<string, any>;
  };
  originLoadingExperience?: {
    metrics: Record<string, any>;
  };
  analysisUTCTimestamp: string;
}

export class PSIClient {
  private apiKey: string;
  private baseUrl = 'https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed';
  private lastRequest = 0;
  private minInterval = 1000; // 1 second throttling

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - elapsed));
    }
    this.lastRequest = Date.now();
  }

  async runAudit(request: PSIRequest): Promise<PSIResponse> {
    await this.throttle();

    const url = new URL(this.baseUrl);
    
    // Only allowed query parameters
    url.searchParams.set('url', request.url);
    url.searchParams.set('key', this.apiKey);
    
    if (request.strategy) {
      url.searchParams.set('strategy', request.strategy);
    }
    
    if (request.locale) {
      url.searchParams.set('locale', request.locale);
    }
    
    // Add categories as multiple parameters
    const categories = request.categories || ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'];
    categories.forEach(category => {
      url.searchParams.append('category', category);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(`PSI rate limit: ${errorData.error?.message || 'Rate limited'}`);
      }
      throw new Error(`PSI API error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  async runAuditWithRetry(request: PSIRequest, maxRetries = 2): Promise<PSIResponse> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.runAudit(request);
      } catch (error: any) {
        lastError = error;
        if (attempt < maxRetries && error.message.includes('rate limit')) {
          // Exponential backoff for retries
          const delay = Math.pow(2, attempt) * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    
    throw lastError!;
  }
}

export function extractMetrics(psiResponse: PSIResponse) {
  const { categories } = psiResponse.lighthouseResult;
  const crux = {
    loadingExperience: psiResponse.loadingExperience?.metrics || {},
    originLoadingExperience: psiResponse.originLoadingExperience?.metrics || {},
  };

  return {
    performance_score: categories.performance?.score || null,
    accessibility_score: categories.accessibility?.score || null,
    best_practices_score: categories['best-practices']?.score || null,
    seo_score: categories.seo?.score || null,
    analysis_ts: new Date(psiResponse.analysisUTCTimestamp),
    crux,
    lhr: {
      categories,
      audits: psiResponse.lighthouseResult.audits,
    },
  };
}
