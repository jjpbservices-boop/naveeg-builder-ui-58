interface APIError extends Error {
  status?: number;
  code?: string;
}

interface APIResponse<T = any> {
  data?: T;
  error?: APIError;
}

class APIClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    // Use the base Supabase function URL without sub-paths
    this.baseUrl = 'https://eilpazegjrcrwgpujqni.supabase.co/functions/v1/ai-router';
    this.defaultTimeout = 30000; // 30 seconds
  }

  private getTimeoutForOperation(operation: string): number {
    // Updated timeouts for new ai-router actions
    if (operation === 'create-website') return 120000; // 2 minutes
    if (operation === 'generate-sitemap') return 90000; // 1.5 minutes  
    if (operation === 'generate-from-sitemap') return 120000; // 2 minutes
    if (operation === 'publish-and-frontpage') return 90000; // 1.5 minutes
    return this.defaultTimeout; // 30 seconds for others
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as any).name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async request<T>(
    action: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      let url = this.baseUrl;
      const timeout = this.getTimeoutForOperation(action);
      
      // For GET requests, append action as query parameter
      if (options.method === 'GET') {
        url += `?action=${encodeURIComponent(action)}`;
      }
      
      console.log(`API Request: ${options.method || 'GET'} ${url} - Action: ${action} (timeout: ${timeout}ms)`);
      console.log('Request headers:', options.headers);
      console.log('Request body:', options.body);

      const response = await this.fetchWithTimeout(url, options, timeout);
      
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error: APIError = new Error(data.error || data || `HTTP ${response.status}`);
        error.status = response.status;
        
        // Add more specific error details
        if (data.details) {
          error.message = `${error.message} - ${data.details}`;
        }
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url,
          error: error.message,
          data
        });
        return { error };
      }

      console.log('API Success:', data);
      return { data };
    } catch (error) {
      console.error('API Request failed:', {
        action,
        error: error.message,
        stack: error.stack
      });
      
      const apiError: APIError = error as APIError;
      
      // Make error messages more user-friendly
      if (error.name === 'AbortError') {
        const operationName = action === 'create-website' ? 'website creation' : 
                             action === 'generate-sitemap' ? 'sitemap generation' :
                             action === 'generate-site' ? 'website generation' : 'operation';
        apiError.message = `${operationName.charAt(0).toUpperCase() + operationName.slice(1)} timed out after ${this.getTimeoutForOperation(action) / 1000} seconds. Your website may still be created - please wait a moment and check your dashboard.`;
      } else if (error.message === 'Load failed') {
        apiError.message = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('NetworkError')) {
        apiError.message = 'Network connection failed. Please try again.';
      }
      
      return { error: apiError };
    }
  }

  async healthCheck(): Promise<APIResponse<{
    status: string;
    timestamp: string;
    available_actions: string[];
  }>> {
    return this.request('health', {
      method: 'GET',
    });
  }

  async checkSubdomain(subdomain: string): Promise<APIResponse<{
    status: string;
    message?: string;
  }>> {
    return this.request('check-subdomain', {
      method: 'POST',
      body: JSON.stringify({ action: 'check-subdomain', subdomain }),
    });
  }

  async createWebsite(payload: {
    businessName: string;
  }): Promise<APIResponse<{
    siteId: string;
    website_id: number;
  }>> {
    return this.request('create-website', {
      method: 'POST',
      body: JSON.stringify({ action: 'create-website', ...payload }),
    });
  }

  async generateSitemap(payload: {
    siteId: string;
    business_type: string;
    business_name: string;
    business_description: string;
  }): Promise<APIResponse<{
    unique_id: string;
    pages_meta: any[];
    seo: {
      seo_title: string;
      seo_description: string;
      seo_keyphrase: string;
    };
    website_type: string;
  }>> {
    return this.request('generate-sitemap', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate-sitemap', ...payload }),
    });
  }

  async generateSite(siteId: string): Promise<APIResponse<{
    url: string;
    website_id: number;
  }>> {
    return this.request('generate-site', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate-site', siteId }),
    });
  }

  async publishPages(website_id: string): Promise<APIResponse<{
    success: boolean;
    pages: any[];
    published_count: number;
  }>> {
    return this.request('publish-pages', {
      method: 'POST',
      body: JSON.stringify({ action: 'publish-pages', website_id }),
    });
  }

  async setFrontPage(website_id: string, page_id: string): Promise<APIResponse<{
    success: boolean;
    front_page_id: string;
  }>> {
    return this.request('set-front-page', {
      method: 'POST',
      body: JSON.stringify({ action: 'set-front-page', website_id, page_id }),
    });
  }

  async getDomains(website_id: string): Promise<APIResponse<{
    domains: any[];
    default_domain: any;
    admin_url: string;
  }>> {
    return this.request('get-domains', {
      method: 'POST',
      body: JSON.stringify({ action: 'get-domains', website_id }),
    });
  }

  async updateDesign(payload: {
    siteId: string;
    colors: { 
      primary_color: string; 
      secondary_color: string; 
      background_dark: string;
    };
    fonts: { heading: string; body: string };
    pages_meta: Array<{ 
      id: string; 
      title: string; 
      type: string; 
      sections?: { title: string }[];
    }>;
    website_type: 'basic' | 'ecommerce';
    seo_title?: string;
    seo_description?: string;
    seo_keyphrase?: string;
  }): Promise<APIResponse<{ success: boolean }>> {
    return this.request('update-design', {
      method: 'POST',
      body: JSON.stringify({ action: 'update-design', ...payload }),
    });
  }

  async attachSite(payload: {
    siteId: string;
  }): Promise<APIResponse<{ success: boolean }>> {
    return this.request('attach-site', {
      method: 'POST',
      body: JSON.stringify({ action: 'attach-site', ...payload }),
    });
  }

  async getAutologinUrl(
    website_id: string,
    admin_url: string
  ): Promise<APIResponse<{ admin_url: string }>> {
    return this.request('autologin', {
      method: 'POST',
      body: JSON.stringify({ action: 'autologin', website_id, admin_url }),
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();