// supabase/functions/ai-router/index.ts
// Deno deployable. Strict CORS. Always returns.

// read body ONCE; never call req.json() again later
Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
  const J = (code: number, data: unknown) =>
    new Response(JSON.stringify(data), { status: code, headers: { 'content-type': 'application/json', ...cors } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const url = new URL(req.url);
  let body: any = {};
  if (req.method === 'POST') { try { body = await req.json(); } catch { body = {}; } }
  const action = url.searchParams.get('action') ?? body.action ?? '';

  // health
  if (req.method === 'GET' && action === 'health')
    return J(200, { status: 'healthy', timestamp: new Date().toISOString(), available_actions: ['create-website'] });

  // create-website
  if (req.method === 'POST' && action === 'create-website') {
    const API_BASE = Deno.env.get('TENWEB_API_BASE') || 'https://api.10web.io';
    const API_KEY  = Deno.env.get('TENWEB_API_KEY')!;
    const H = { 'content-type':'application/json', 'x-api-key': API_KEY };

    const slug = (s:string) => (s||'site').normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,45) || 'site';

    const name = body.businessName || body.siteTitle || 'New Site';
    const base = slug(name);

    const tw = async (path:string, init:RequestInit & {timeoutMs?:number}={}) => {
      const ctl = new AbortController();
      const id = setTimeout(()=>ctl.abort(), init.timeoutMs ?? 150000);
      try {
        const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctl.signal });
        const txt = await res.text();
        const json = txt ? JSON.parse(txt) : null;
        if (!res.ok) throw { status: res.status, json };
        return json;
      } finally { clearTimeout(id); }
    };

    // free subdomain
    const ensureFree = async () => {
      let sub = base;
      for (let i=0;i<6;i++) {
        try {
          await tw('/v1/hosting/websites/subdomain/check', { method:'POST', headers:H, body: JSON.stringify({ subdomain: sub }), timeoutMs:15000 });
          return sub;
        } catch {
          const g = await tw('/v1/hosting/websites/subdomain/generate', { method:'POST', headers:H, timeoutMs:15000 });
          sub = g?.subdomain || `${base}-${crypto.randomUUID().slice(0,8)}`;
        }
      }
      throw { code:'NO_FREE_SUBDOMAIN' };
    };

    try {
      let sub = await ensureFree();
      const r = await tw('/v1/hosting/website', {
        method:'POST', headers:H,
        body: JSON.stringify({
          subdomain: sub,
          region: 'europe-west3-b',
          site_title: name,
          admin_username: 'admin',
          admin_password: crypto.randomUUID().replace(/-/g,'').slice(0,16)+'Aa1!'
        }),
        timeoutMs: 150000
      });
      return J(200, { ok:true, website_id: r?.data?.website_id, subdomain: sub });
    } catch (e:any) {
      const code = e?.json?.error?.code || e?.code;
      if (code === 'error.subdomain_in_use2') return J(409, { code:'SUBDOMAIN_IN_USE' });
      return J(502, { code:'CREATE_FAILED', detail: e?.json ?? e?.message ?? e });
    }
  }

  return J(404, { error:'NOT_FOUND', hint:'use action=health or POST create-website' });
});