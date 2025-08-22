const SUPABASE_URL = 'https://eilpazegjrcrwgpujqni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4';

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 60000 // Default 60 second timeout
): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail?.message || errorData.code || `HTTP error! status: ${response.status}`);
      (error as any).code = errorData.code;
      (error as any).status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API request failed:', error);
    
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeoutMs/1000} seconds`);
      (timeoutError as any).code = 'TIMEOUT';
      throw timeoutError;
    }
    
    throw error;
  }
};

export const healthCheck = async (): Promise<any> => {
  return apiRequest('ai-router?action=health', {
    method: 'GET',
  });
};

export const createWebsite = async (businessName: string): Promise<any> => {
  return apiRequest('ai-router', {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-website',
      businessName,
    }),
  });
};

export const generateSitemap = async (
  websiteId: number,
  params: {
    business_type: string;
    business_name: string;
    business_description: string;
  }
): Promise<any> => {
  return apiRequest('ai-router', {
    method: 'POST',
    body: JSON.stringify({
      action: 'generate-sitemap',
      website_id: websiteId,
      params,
    }),
  }, 120000); // 2 minute timeout for sitemap generation
};

export const updateDesign = async (
  siteId: number | string,
  design: any
): Promise<any> => {
  return apiRequest('ai-router', {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-design',
      siteId,
      design,
    }),
  });
};

export const generateFromSitemap = async (
  websiteId: number,
  uniqueId: string,
  params: any
): Promise<any> => {
  return apiRequest('ai-router', {
    method: 'POST',
    body: JSON.stringify({
      action: 'generate-from-sitemap',
      website_id: websiteId,
      unique_id: uniqueId,
      params,
    }),
  });
};

export const publishAndFrontpage = async (websiteId: number): Promise<any> => {
  return apiRequest('ai-router', {
    method: 'POST',
    body: JSON.stringify({
      action: 'publish-and-frontpage',
      website_id: websiteId,
    }),
  });
};