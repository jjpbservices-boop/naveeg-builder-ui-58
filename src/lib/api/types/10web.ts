import { getSupabaseClient } from '@/lib/supabase';
import { z } from 'zod';

// 10Web API Types based on their OpenAPI spec
export interface TenWebWebsiteResponse {
  website_id: string;
  site_url: string;
  admin_url: string;
  subdomain: string;
  status: 'building' | 'active' | 'error';
  progress?: number;
}

export interface TenWebGenerateSitemapRequest {
  business_description: string;
  business_type: string;
  website_title: string;
  website_description: string;
  website_keyphrase: string;
}

export interface TenWebGenerateSitemapResponse {
  sitemap_id: string;
  sitemap: any;
  pages: Array<{
    title: string;
    description: string;
    url: string;
  }>;
}

export interface TenWebCreateSiteRequest {
  sitemap_id: string;
  primary_color?: string;
  secondary_color?: string;
  heading_font?: string;
  body_font?: string;
}

// Validation schemas
export const TenWebGenerateSitemapSchema = z.object({
  business_description: z.string().min(10),
  business_type: z.string().min(1),
  website_title: z.string().min(1),
  website_description: z.string().min(10),
  website_keyphrase: z.string().min(1),
});

export const TenWebCreateSiteSchema = z.object({
  sitemap_id: z.string().min(1),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  heading_font: z.string().optional(),
  body_font: z.string().optional(),
});

// API client for 10Web integration
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

  async generateSitemap(request: TenWebGenerateSitemapRequest): Promise<TenWebGenerateSitemapResponse> {
    const validatedRequest = TenWebGenerateSitemapSchema.parse(request);
    
    return this.makeRequest<TenWebGenerateSitemapResponse>('/v1/ai/generate_sitemap', {
      method: 'POST',
      body: JSON.stringify(validatedRequest),
    });
  }

  async createWebsite(request: TenWebCreateSiteRequest): Promise<TenWebWebsiteResponse> {
    const validatedRequest = TenWebCreateSiteSchema.parse(request);
    
    return this.makeRequest<TenWebWebsiteResponse>('/v1/ai/generate_site_from_sitemap', {
      method: 'POST',
      body: JSON.stringify(validatedRequest),
    });
  }

  async getWebsiteStatus(websiteId: string): Promise<TenWebWebsiteResponse> {
    return this.makeRequest<TenWebWebsiteResponse>(`/v1/hosting/ai-website/${websiteId}`);
  }

  async getWordPressLoginToken(websiteId: string): Promise<{ token: string; wp_admin_url: string }> {
    return this.makeRequest<{ token: string; wp_admin_url: string }>(`/v1/hosting/ai-website/${websiteId}/wp-login-token`, {
      method: 'POST',
    });
  }
}

// Helper functions for common operations
export async function saveWebsiteToDatabase(
  userId: string,
  websiteData: TenWebWebsiteResponse,
  businessData: any
): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.from('websites').insert({
    user_id: userId,
    title: businessData.website_title || 'My Website',
    description: businessData.website_description || '',
    site_url: websiteData.site_url,
    admin_url: websiteData.admin_url,
    tenweb_website_id: websiteData.website_id,
    subdomain: websiteData.subdomain,
    status: websiteData.status as any,
    business_type: businessData.business_type,
    primary_color: businessData.primary_color,
    secondary_color: businessData.secondary_color,
  } as any);
  
  if (error) {
    throw new Error(`Failed to save website to database: ${error.message}`);
  }
}