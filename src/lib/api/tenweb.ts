import { TenWebAPI, type TenWebGenerateSitemapRequest, type TenWebCreateSiteRequest } from './types/10web';

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
  
  // Step 1: Generate sitemap
  const sitemapRequest: TenWebGenerateSitemapRequest = {
    business_description: briefData.business_description,
    business_type: briefData.business_type,
    website_title: briefData.website_title,
    website_description: briefData.website_description,
    website_keyphrase: briefData.website_keyphrase,
  };
  
  const sitemapResponse = await api.generateSitemap(sitemapRequest);
  
  // Step 2: Create website from sitemap
  const createRequest: TenWebCreateSiteRequest = {
    sitemap_id: sitemapResponse.sitemap_id,
    primary_color: briefData.primary_color,
    secondary_color: briefData.secondary_color,
    heading_font: briefData.heading_font,
    body_font: briefData.body_font,
  };
  
  const websiteResponse = await api.createWebsite(createRequest);
  
  return {
    sitemap: sitemapResponse,
    website: websiteResponse,
  };
}

export async function getWebsiteStatus(websiteId: string) {
  const api = getTenWebAPI();
  return api.getWebsiteStatus(websiteId);
}

export async function getWordPressLoginToken(websiteId: string) {
  const api = getTenWebAPI();
  return api.getWordPressLoginToken(websiteId);
}