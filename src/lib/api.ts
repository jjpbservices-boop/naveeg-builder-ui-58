import { supabase } from '@/integrations/supabase/client';

// Export type definitions
export interface CreateWebsiteResult {
  ok: boolean;
  website_id: number;
  subdomain: string;
  reused: boolean;
}

export interface SitemapResult {
  unique_id: string;
  pages_meta: any[];
  seo: {
    website_title: string;
    website_description: string;
    website_keyphrase: string;
  };
  colors: {
    primary_color: string;
    secondary_color: string;
    background_dark: string;
  };
  fonts: {
    primary_font: string;
  };
  website_type: string;
}

export interface PublishResult {
  preview_url: string;
  admin_url: string;
}

// Helper to call edge function
const callEdgeFunction = async (action: string, body: any) => {
  const { data, error } = await supabase.functions.invoke('ai-router', {
    body: { action, ...body }
  });
  
  if (error) throw error;
  if (!data?.ok && data?.error) throw new Error(data.error);
  
  return data;
};

// Main API object
export const api = {
  // Create website
  async createWebsite(businessName: string): Promise<CreateWebsiteResult> {
    return await callEdgeFunction('createWebsite', { businessName });
  },

  // Generate sitemap
  async generateSitemap(website_id: number, params: any): Promise<SitemapResult> {
    return await callEdgeFunction('generateSitemap', { website_id, params });
  },

  // Generate from sitemap with polling
  async generateFromWithPolling(website_id: number, unique_id: string, params: any): Promise<void> {
    // Initial generation call
    await callEdgeFunction('generateFromSitemap', { website_id, unique_id, params });
    
    // Poll for completion
    const pollStart = Date.now();
    const maxPollTime = 5 * 60 * 1000; // 5 minutes
    
    while (Date.now() - pollStart < maxPollTime) {
      try {
        // Check if pages are ready
        const result = await callEdgeFunction('checkGeneration', { website_id });
        if (result.ready) {
          return;
        }
      } catch (error) {
        console.log('Polling check failed, continuing...', error);
      }
      
      // Wait 3 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    throw new Error('Generation timeout - website may still be processing');
  },

  // Publish and set front page with polling
  async publishAndFrontWithPolling(website_id: number): Promise<PublishResult> {
    const result = await callEdgeFunction('publishAndFrontpage', { website_id });
    return {
      preview_url: result.preview_url,
      admin_url: result.admin_url
    };
  }
};

// Export update design function
export const updateDesign = async (siteId: number, design: any) => {
  return await callEdgeFunction('updateDesign', { siteId, design });
};