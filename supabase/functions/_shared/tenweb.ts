const TENWEB_API_KEY = Deno.env.get('TENWEB_API_KEY');
const TENWEB_BASE_URL = 'https://api.10web.io';

if (!TENWEB_API_KEY) {
  throw new Error('TENWEB_API_KEY environment variable is required');
}

export interface TenwebSite {
  id: string;
  name: string;
  url: string;
  admin_url: string;
  status: 'creating' | 'ready' | 'error';
}

export interface TenwebJob {
  id: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  progress: number;
  message: string;
}

export interface TenwebSitemapNode {
  id: string;
  title: string;
  kind: 'page' | 'category';
  children?: TenwebSitemapNode[];
}

export interface TenwebSeo {
  title: string;
  description: string;
  keyphrase: string;
}

export interface CreateFromBriefResponse {
  job_id: string;
  tenweb_site_id: string;
  sitemap: TenwebSitemapNode[];
  seo: TenwebSeo;
}

export interface GenerateFromSitemapResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
}

class TenwebClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${TENWEB_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`10Web API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async createFromBrief(data: { name: string; description: string }): Promise<CreateFromBriefResponse> {
    try {
      const response = await this.makeRequest('/ai-website/create', {
        method: 'POST',
        body: JSON.stringify({
          business_name: data.name,
          business_description: data.description,
          type: 'basic' // Default to basic, can be changed in brief step
        }),
      });

      // Map 10Web response to our format
      return {
        job_id: response.job_id,
        tenweb_site_id: response.site_id,
        sitemap: this.mapSitemap(response.sitemap || []),
        seo: {
          title: response.seo?.title || `${data.name} - Professional Website`,
          description: response.seo?.description || data.description,
          keyphrase: response.seo?.keyphrase || data.name.toLowerCase()
        }
      };
    } catch (error) {
      console.error('10Web createFromBrief error:', error);
      throw new Error(`Failed to create site from brief: ${error.message}`);
    }
  }

  async getJobStatus(jobId: string): Promise<TenwebJob> {
    try {
      const response = await this.makeRequest(`/jobs/${jobId}`);
      
      return {
        id: jobId,
        status: response.status,
        progress: response.progress || 0,
        message: response.message || 'Processing...'
      };
    } catch (error) {
      console.error('10Web getJobStatus error:', error);
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }

  async generateFromSitemap(data: {
    tenweb_site_id: string;
    sitemap: any[];
    theme: any;
  }): Promise<GenerateFromSitemapResponse> {
    try {
      const response = await this.makeRequest('/ai-website/regenerate', {
        method: 'POST',
        body: JSON.stringify({
          site_id: data.tenweb_site_id,
          sitemap: data.sitemap,
          theme: data.theme
        }),
      });

      return {
        job_id: response.job_id,
        status: 'pending'
      };
    } catch (error) {
      console.error('10Web generateFromSitemap error:', error);
      throw new Error(`Failed to generate from sitemap: ${error.message}`);
    }
  }

  private mapSitemap(tenwebSitemap: any[]): TenwebSitemapNode[] {
    // Map 10Web sitemap format to our format
    return tenwebSitemap.map((node, index) => ({
      id: node.id || `node-${index}`,
      title: node.title || node.name || 'Untitled',
      kind: node.type === 'category' ? 'category' : 'page',
      children: node.children ? this.mapSitemap(node.children) : undefined
    }));
  }
}

export const tenwebClient = new TenwebClient(TENWEB_API_KEY);
