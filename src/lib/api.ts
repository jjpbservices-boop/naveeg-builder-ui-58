const SUPABASE_URL = 'https://eilpazegjrcrwgpujqni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4';

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.message || errorData.code || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
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
  });
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