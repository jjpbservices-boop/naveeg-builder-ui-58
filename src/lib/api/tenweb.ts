import { 
  GenerateSitemapRequest, 
  CreateSiteFromSitemapRequest,
  GenerateSitemapResponse,
  WebsiteCreationResponse,
  CreateAiWebsiteRequest
} from './types/10web';
import { getSupabaseClient } from '@/lib/supabase';

// 10Web API client class
export class TenWebAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.TENWEB_API_BASE || 'https://api.10web.io';
    this.apiKey = import.meta.env.TENWEB_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('TENWEB_API_KEY is required');
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`TenWeb API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async generateSitemap(request: GenerateSitemapRequest): Promise<GenerateSitemapResponse> {
    return this.makeRequest<GenerateSitemapResponse>('/v1/ai/generate_sitemap', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async createWebsite(request: CreateAiWebsiteRequest): Promise<WebsiteCreationResponse> {
    return this.makeRequest<WebsiteCreationResponse>('/v1/hosting/ai-website', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async createFromSitemap(request: CreateSiteFromSitemapRequest): Promise<WebsiteCreationResponse> {
    return this.makeRequest<WebsiteCreationResponse>('/v1/ai/generate_site_from_sitemap', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getWebsiteStatus(websiteId: number): Promise<WebsiteCreationResponse> {
    return this.makeRequest<WebsiteCreationResponse>(`/v1/hosting/ai-website/${websiteId}`);
  }

  async getWordPressLoginToken(websiteId: number): Promise<{ token: string; wp_admin_url: string }> {
    return this.makeRequest<{ token: string; wp_admin_url: string }>(`/v1/account/websites/${websiteId}/single?admin_url=1`);
  }
}

// Initialize TenWeb API client
let tenWebAPI: TenWebAPI | null = null;

export function getTenWebAPI(): TenWebAPI {
  if (!tenWebAPI) {
    tenWebAPI = new TenWebAPI();
  }
  return tenWebAPI;
}

// Helper functions for common TenWeb operations
export async function createWebsiteFromBrief(briefData: {
  business_description: string;
  business_type: string;
  website_title: string;
  website_description: string;
  website_keyphrase: string;
  primary_color?: string;
  secondary_color?: string;
  heading_font?: string;
  body_font?: string;
}) {
  const api = getTenWebAPI();
  
  const createRequest: CreateAiWebsiteRequest = {
    business_description: briefData.business_description,
    business_type: briefData.business_type,
    website_title: briefData.website_title,
    website_description: briefData.website_description,
    website_keyphrase: briefData.website_keyphrase,
    design_preferences: {
      primary_color: briefData.primary_color,
      secondary_color: briefData.secondary_color,
      heading_font: briefData.heading_font,
      body_font: briefData.body_font,
    },
  };
  
  return api.createWebsite(createRequest);
}

export async function getWebsiteStatus(websiteId: number) {
  const api = getTenWebAPI();
  return api.getWebsiteStatus(websiteId);
}

export async function getWordPressLoginToken(websiteId: number) {
  const api = getTenWebAPI();
  return api.getWordPressLoginToken(websiteId);
}