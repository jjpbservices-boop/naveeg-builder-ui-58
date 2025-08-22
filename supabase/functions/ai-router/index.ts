// supabase/functions/ai-router/index.ts
// Deno deployable. Strict CORS. Always returns.

const API_BASE = Deno.env.get('TENWEB_API_BASE') || 'https://api.10web.io';
const API_KEY  = Deno.env.get('TENWEB_API_KEY')!;
const H = { 'content-type': 'application/json', 'x-api-key': API_KEY };

const ORIGIN_ALLOW = [
  /^https?:\/\/localhost:\d+$/,
  /^https:\/\/(preview-)?naveeg-builder-ui(-[\w]+)?\.lovable\.app$/,
  /^https:\/\/preview-.*\.lovable\.app$/
];

function corsHeaders(origin: string) {
  const ok = ORIGIN_ALLOW.some(r => r.test(origin));
  const allow = ok ? origin : 'https://preview-naveeg-builder-ui.lovable.app';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

const J = (code: number, data: unknown, origin = '') =>
  new Response(JSON.stringify(data), { status: code, headers: { 'content-type': 'application/json', ...corsHeaders(origin) } });

function slugify(s = 'site') {
  return s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 45) || 'site';
}

async function tw(path: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 150000); // 150s
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctl.signal });
    const txt = await res.text();
    const json = txt ? JSON.parse(txt) : null;
    if (!res.ok) throw { status: res.status, json, path };
    return json;
  } catch (e) {
    if ((e as any).name === 'AbortError') throw { aborted: true, path };
    throw e;
  } finally {
    clearTimeout(id);
  }
}

async function listSites() {
  const r = await tw('/v1/account/websites', { method: 'GET', headers: H, timeoutMs: 40000 });
  return r?.data ?? [];
}
async function findBySub(sub: string) {
  const all = await listSites();
  return all.find((w: any) => w?.site_url?.includes(`${sub}.`) || w?.admin_url?.includes(`${sub}.`));
}
async function ensureFreeSub(base: string) {
  let s = base;
  for (let i = 0; i < 6; i++) {
    try {
      await tw('/v1/hosting/websites/subdomain/check', { method: 'POST', headers: H, body: JSON.stringify({ subdomain: s }), timeoutMs: 15000 });
      return s;
    } catch {
      const g = await tw('/v1/hosting/websites/subdomain/generate', { method: 'POST', headers: H, timeoutMs: 15000 });
      s = g?.subdomain || `${base}-${crypto.randomUUID().slice(0, 8)}`;
    }
  }
  throw { code: 'NO_FREE_SUBDOMAIN' };
}
async function createWebsite(businessName: string) {
  const base = slugify(businessName);
  // Reuse if previous attempt succeeded
  const reused = await findBySub(base);
  if (reused) return { website_id: reused.id, subdomain: base };

  let sub = await ensureFreeSub(base);
  for (let i = 0; i < 5; i++) {
    try {
      const r = await tw('/v1/hosting/website', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({
          subdomain: sub,
          region: 'europe-west3-b',
          site_title: businessName,
          admin_username: 'admin',
          admin_password: crypto.randomUUID().replace(/-/g, '').slice(0, 16) + 'Aa1!'
        }),
        timeoutMs: 150000
      });
      return { website_id: r?.data?.website_id, subdomain: sub };
    } catch (e: any) {
      if (e?.aborted) {
        const maybe = await findBySub(sub);
        if (maybe) return { website_id: maybe.id, subdomain: sub };
      }
      const code = e?.json?.error?.code || e?.json?.code;
      if (code === 'error.subdomain_in_use2') {
        const g = await tw('/v1/hosting/websites/subdomain/generate', { method: 'POST', headers: H, timeoutMs: 15000 });
        sub = g?.subdomain || `${base}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      throw e;
    }
  }
  throw { code: 'SUBDOMAIN_COLLISION' };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || (await req.clone().json().catch(() => ({} as any))).action;

    if (req.method === 'GET' && action === 'health') {
      return J(200, { status: 'healthy', timestamp: new Date().toISOString(), available_actions: ['create-website'] }, origin);
    }

    if (req.method === 'POST' && action === 'create-website') {
      const body = await req.json().catch(() => ({}));
      const name = body?.businessName || body?.siteTitle || 'New Site';
      const r = await createWebsite(name);
      return J(200, { ok: true, ...r }, origin);
    }

    return J(404, { error: 'NOT_FOUND', hint: 'use action=health or POST create-website' }, origin);
  } catch (e: any) {
    const code = e?.code === 'SUBDOMAIN_COLLISION' ? 409 : 502;
    return J(code, { code: e?.code || 'SERVER_ERROR', detail: e?.json ?? e?.message ?? e }, req.headers.get('origin') || '');
  }
});