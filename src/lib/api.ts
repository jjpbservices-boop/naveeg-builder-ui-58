const F_BASE = 'https://eilpazegjrcrwgpujqni.supabase.co/functions/v1/ai-router';
const H = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4',
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4'
};

const TIMEOUT = { 
  short: 30000,   // 30 seconds
  mid: 90000,     // 90 seconds  
  long: 180000    // 180 seconds
};

async function request(body: any, timeout = TIMEOUT.mid) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  
  try {
    const res = await fetch(F_BASE, { 
      method: 'POST', 
      headers: H, 
      body: JSON.stringify(body), 
      signal: ctl.signal 
    });
    
    const txt = await res.text();
    const json = txt ? JSON.parse(txt) : null;
    
    if (!res.ok) {
      const err: any = new Error(json?.code || res.statusText);
      err.status = res.status; 
      err.code = json?.code; 
      err.detail = json;
      throw err;
    }
    
    return json;
  } catch (e: any) {
    if (e?.name === 'AbortError') { 
      e.code = 'CLIENT_TIMEOUT'; 
    }
    throw e;
  } finally { 
    clearTimeout(t); 
  }
}

export const api = {
  createWebsite: (businessName: string) =>
    request({ action: 'create-website', businessName }, TIMEOUT.mid),

  generateSitemap: (website_id: number, params: any) =>
    request({ action: 'generate-sitemap', website_id, params }, TIMEOUT.long),

  generateFromSitemap: (payload: any) =>
    request({ action: 'generate-from-sitemap', ...payload }, TIMEOUT.long),

  publishAndFrontpage: (website_id: number) =>
    request({ action: 'publish-and-frontpage', website_id }, TIMEOUT.mid),
};

// Legacy exports for backward compatibility
export const createWebsite = api.createWebsite;
export const generateSitemap = api.generateSitemap;
export const generateFromSitemap = (websiteId: number, uniqueId: string, params: any) =>
  api.generateFromSitemap({ website_id: websiteId, unique_id: uniqueId, params });
export const publishAndFrontpage = api.publishAndFrontpage;

// Add missing updateDesign export
export const updateDesign = async (siteId: number | string, design: any): Promise<any> => {
  return request({ action: 'update-design', siteId, design }, TIMEOUT.mid);
};