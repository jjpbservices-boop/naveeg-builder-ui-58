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
      console.log('Request headers:', options.headers);
      console.log('Request body:', options.body);

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
        endpoint,
        error: error.message,
        stack: error.stack
      });
      
      const apiError: APIError = error as APIError;
      
      // Make error messages more user-friendly
      if (error.name === 'AbortError') {
        apiError.message = 'Request timed out. Please check your connection and try again.';
      } else if (error.message === 'Load failed') {
        apiError.message = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('NetworkError')) {
        apiError.message = 'Network connection failed. Please try again.';
      }
      
      return { error: apiError };
    }
  }

  async createWebsite(payload: {
    subdomain?: string;
    siteTitle?: string;
  }): Promise<APIResponse<{
    siteId: string;
    website_id: number;
  }>> {
    return this.request('/create-website', {
      method: 'POST',
      body: JSON.stringify(payload),
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
    return this.request('/generate-sitemap', {
      method: 'POST',
      body: JSON.stringify(payload),
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
    return this.request('/update-design', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async attachSite(payload: {
    siteId: string;
  }): Promise<APIResponse<{ success: boolean }>> {
    return this.request('/attach-site', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAutologinUrl(
    website_id: string,
    admin_url: string
  ): Promise<APIResponse<{ admin_url: string }>> {
    const params = new URLSearchParams({
      website_id,
      admin_url,
    });
    
    return this.request(`/autologin?${params.toString()}`, {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();