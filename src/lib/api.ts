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
  private timeout: number;

  constructor() {
    // Use the full Supabase function URL
    this.baseUrl = 'https://eilpazegjrcrwgpujqni.supabase.co/functions/v1/ai-router';
    this.timeout = 30000; // 30 seconds
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
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
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`API Request: ${options.method || 'GET'} ${url}`);

      const response = await this.fetchWithTimeout(url, options);
      
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
        console.error('API Error:', error);
        return { error };
      }

      console.log('API Success:', data);
      return { data };
    } catch (error) {
      console.error('API Request failed:', error);
      const apiError: APIError = error as APIError;
      return { error: apiError };
    }
  }

  async createWebsite(payload: {
    email: string;
    subdomainSlug?: string;
    region?: string;
    siteTitle: string;
    adminUsername?: string;
    businessName: string;
    businessType: string;
    businessDescription: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeyphrase?: string;
  }): Promise<APIResponse<{
    siteId: string;
    website_id: number;
    site_url: string;
    admin_url: string;
  }>> {
    return this.request('/create-website', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async generateSitemap(siteId: string): Promise<APIResponse<{
    unique_id: string;
  }>> {
    return this.request('/generate-sitemap', {
      method: 'POST',
      body: JSON.stringify({ siteId }),
    });
  }

  async generateFromSitemap(siteId: string): Promise<APIResponse<{
    url: string;
  }>> {
    return this.request('/generate-from-sitemap', {
      method: 'POST',
      body: JSON.stringify({ siteId }),
    });
  }

  async publishAndFrontpage(payload: {
    website_id: number;
    front_page_id: number;
    publish_ids: number[];
  }): Promise<APIResponse<{ success: boolean }>> {
    return this.request('/publish-and-frontpage', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAutologinUrl(
    website_id: string,
    admin_url: string,
    email: string
  ): Promise<APIResponse<{ admin_url: string }>> {
    const params = new URLSearchParams({
      website_id,
      admin_url,
      email,
    });
    
    return this.request(`/autologin?${params.toString()}`, {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();