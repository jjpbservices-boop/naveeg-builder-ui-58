const FN = `https://eilpazegjrcrwgpujqni.supabase.co/functions/v1/ai-router`;
const H = {
  'content-type':'application/json',
  authorization:`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4`,
  apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4',
};

async function post(payload:any, timeout=120_000){
  const ctl = new AbortController(); const t = setTimeout(()=>ctl.abort(), timeout);
  try{
    const r = await fetch(FN, { method:'POST', headers:H, body:JSON.stringify(payload), signal:ctl.signal });
    const j = await r.json().catch(()=>null);
    if(!r.ok){ const e:any = new Error(j?.code || r.statusText); e.status=r.status; e.code=j?.code; e.detail=j; throw e; }
    return j;
  } finally{ clearTimeout(t); }
}

export const api = {
  health:            ()                       => fetch(`${FN}?action=health`,{headers:H}).then(r=>r.json()),
  createWebsite:     (businessName:string)    => post({ action:'create-website', businessName }, 90_000),
  generateSitemap:   (website_id:number,params:any)=> post({ action:'generate-sitemap', website_id, params }, 180_000),
  updateDesign:      (siteId:number, design:any)=> post({ action:'update-design', siteId, design }, 30_000),
  generateFrom:      (website_id:number, unique_id:string, params:any)=> post({ action:'generate-from-sitemap', website_id, unique_id, params }, 180_000),
  publishAndFront:   (website_id:number)      => post({ action:'publish-and-frontpage', website_id }, 90_000),
};

// Legacy exports for backward compatibility
export const createWebsite = api.createWebsite;
export const generateSitemap = api.generateSitemap;
export const generateFromSitemap = (websiteId: number, uniqueId: string, params: any) =>
  api.generateFrom(websiteId, uniqueId, params);
export const publishAndFrontpage = api.publishAndFront;
export const updateDesign = api.updateDesign;