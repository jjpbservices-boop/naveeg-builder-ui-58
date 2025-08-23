// supabase/functions/ai-router/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const VERSION = "v-shortpoll-strict-3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const API_BASE = Deno.env.get("TENWEB_API_BASE") ?? "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS + JSON helper
const cors = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-api-key, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
});
const J = (code: number, data: unknown) =>
  new Response(JSON.stringify(data), { status: code, headers: { "content-type": "application/json", ...cors() } });

// 10Web fetch
type TwInit = RequestInit & { timeoutMs?: number };
const tw = async (path: string, init: TwInit = {}) => {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 60_000);
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...(init.headers as Record<string, string> | undefined),
    };
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers, signal: ctl.signal });
    const txt = await res.text();
    let json: any = null;
    try { json = txt ? JSON.parse(txt) : null; } catch {}
    if (!res.ok) throw { status: res.status, json, raw: txt };
    return json;
  } finally { clearTimeout(id); }
};

// utils
const pick = (src: any, keys: string[]) => { const o: any = {}; for (const k of keys) if (src?.[k] !== undefined) o[k] = src[k]; return o; };
const need = (o: any, k: string) => o?.[k] !== undefined && o[k] !== null && o[k] !== "";
const slugify = (t?: string) =>
  (t || "site").toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 45) || "site";
const subCandidate = (base: string, salt: string) =>
  (base + "-" + salt).toLowerCase().replace(/[^a-z0-9-]+/g, "").slice(0, 45);
const listSites = async () => { try { return await tw("/v1/account/websites",{method:"GET",timeoutMs:30_000}); } catch { return {data:[]}; } };
const findBySub = async (sub: string) => {
  const s = await listSites();
  return s.data?.find((w: any) => w?.site_url?.includes(`${sub}.`) || w?.admin_url?.includes(`${sub}.`));
};
const ensureFreeSub = async (base: string) => {
  try { await tw("/v1/hosting/websites/subdomain/check",{method:"POST",body:JSON.stringify({subdomain:base}),timeoutMs:10_000}); return base; } catch {}
  for (let i=0;i<18;i++){ const sub=subCandidate(base,Math.random().toString(36).slice(2,8));
    try { await tw("/v1/hosting/websites/subdomain/check",{method:"POST",body:JSON.stringify({subdomain:sub}),timeoutMs:10_000}); return sub; } catch {} }
  return subCandidate(base,Date.now().toString(36));
};

// ---- handlers ----

// create-website (unchanged flow)
const handleCreateWebsite = async (body: any) => {
  const businessName = (body?.businessName || body?.business_name || "New Site").toString().trim();
  const base = slugify(businessName);
  const existing = await findBySub(base);
  if (existing) return J(200, { ok: true, website_id: existing.id, subdomain: base, reused: true });

  let candidate = await ensureFreeSub(base);
  const payload = (sub: string, region: string) => ({
    subdomain: sub, region, site_title: businessName,
    admin_username: "admin", admin_password: crypto.randomUUID().replace(/-/g,"").slice(0,16) + "Aa1!",
  });

  for (let i=0;i<12;i++){
    try{
      try{
        const r = await tw("/v1/hosting/website",{method:"POST",body:JSON.stringify(payload(candidate,"europe-west3-b")),timeoutMs:25_000});
        return J(200,{ ok:true, website_id:r?.data?.website_id, subdomain:candidate, reused:false });
      }catch(e:any){
        if (e?.status===400 || e?.status===422){
          const r2 = await tw("/v1/hosting/website",{method:"POST",body:JSON.stringify(payload(candidate,"europe-west3")),timeoutMs:25_000});
          return J(200,{ ok:true, website_id:r2?.data?.website_id, subdomain:candidate, reused:false });
        }
        throw e;
      }
    }catch(e:any){
      const msg = JSON.stringify(e?.json || e?.raw || e?.message || "");
      if (e?.status===409 || /subdomain.*use/i.test(msg)){ candidate=subCandidate(base,Math.random().toString(36).slice(2,8)); continue; }
      if (e?.name==="AbortError"){
        for(let p=0;p<20;p++){ await new Promise(r=>setTimeout(r,2000)); const polled = await findBySub(candidate);
          if (polled) return J(200,{ ok:true, website_id:polled.id, subdomain:candidate, reused:false }); }
      }
      throw e;
    }
  }
  return J(409,{ code:"SUBDOMAIN_EXHAUSTED" });
};

// generate-sitemap (minimal, tolerant)
const handleGenerateSitemap = async (body: any) => {
  const website_id = body?.website_id;
  let params = body?.params ?? {};
  if (!website_id) return J(400,{ code:"BAD_REQUEST", error:"Missing website_id" });

  const clean = {
    business_name: params.business_name || params.businessName || "Business",
    business_description: params.business_description || params.description || "Description",
    business_type: params.business_type || (params.website_type === "ecommerce" ? "ecommerce" : "informational"),
  };
  if (!clean.business_name || !clean.business_description)
    return J(422,{ code:"VALIDATION_ERROR", details:[{message:`"params.business_name" and "params.business_description" are required`, path:["params"]}] });

  const result = await tw("/v1/ai/generate_sitemap",{
    method:"POST", body:JSON.stringify({ website_id, params: clean }), timeoutMs:120_000
  });

  const pages_meta = Array.isArray(result?.pages_meta) && result.pages_meta.length
    ? result.pages_meta
    : [
        { title: "Home", sections: [{ section_title: "Hero" }, { section_title: "About Us" }] },
        { title: "Contact", sections: [{ section_title: "Get In Touch" }] },
      ];

  return J(200,{
    unique_id: result?.unique_id || result?.sitemap_unique_id || crypto.randomUUID(),
    pages_meta,
    seo: result?.seo || {},
    colors: result?.colors || {},
    fonts: result?.fonts || { primary_font: "Inter" },
    website_type: clean.business_type === "ecommerce" ? "ecommerce" : "basic",
  });
};

// generate-from-sitemap (STRICT + short poll)
const handleGenerateFromSitemap = async (body: any) => {
  const website_id = body?.website_id;
  const unique_id = body?.unique_id || body?.sitemap_unique_id;
  const params = body?.params ?? {};
  if (!website_id || !unique_id) return J(400, { code: "BAD_REQUEST", error: "Missing website_id or unique_id" });

  const allowed = [
    "business_type","business_name","business_description","colors","fonts","pages_meta",
    "website_description","website_keyphrase","website_title","website_type",
  ];
  const clean = pick(params, allowed);

  const required = ["business_type","business_name","business_description","pages_meta","website_description","website_keyphrase","website_title"];
  for (const k of required) {
    if (!need(clean, k)) return J(422, { code: "VALIDATION_ERROR", details: [{ message: `"params.${k}" is required`, path: ["params", k] }] });
  }
  if (!Array.isArray(clean.pages_meta) || clean.pages_meta.length === 0)
    return J(422, { code: "VALIDATION_ERROR", details: [{ message: `"params.pages_meta" must be a non-empty array`, path: ["params","pages_meta"] }] });

  try {
    await tw("/v1/ai/generate_site_from_sitemap", {
      method: "POST",
      body: JSON.stringify({ website_id, unique_id, params: clean }),
      timeoutMs: 25_000,
    });
  } catch (e: any) {
    const msg = JSON.stringify(e?.json || e?.raw || "");
    if (e?.status === 422 && e?.json?.error?.details) return J(422, { code: "VALIDATION_ERROR", details: e.json.error.details });
    if (![417,504].includes(e?.status ?? 0) && e?.name !== "AbortError" && !/in progress/i.test(msg))
      return J(502, { code: "GENERATE_FAILED", detail: e?.json || e?.raw || String(e) });
  }

  const deadline = Date.now() + 30_000;
  let wait = 2000;
  while (Date.now() < deadline) {
    try {
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 10_000 });
      const list = Array.isArray(pages?.data) ? pages.data : [];
      if (list.length > 0) return J(200, { ok: true, pages_count: list.length });
    } catch {}
    await new Promise(r => setTimeout(r, wait));
    wait = Math.min(wait + 1000, 6000);
  }
  return J(200, { ok: false, in_progress: true });
};

// publish-and-frontpage
const handlePublishAndFrontpage = async (body: any) => {
  const website_id = body?.website_id;
  if (!website_id) return J(400, { code: "BAD_REQUEST", error: "Missing website_id" });

  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    try {
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 30_000 });
      const list: any[] = Array.isArray(pages?.data) ? pages.data : [];
      if (list.length === 0) { await new Promise(r => setTimeout(r, 3000)); continue; }

      try {
        await tw(`/v1/builder/websites/${website_id}/pages/publish`, {
          method: "POST", body: JSON.stringify({ page_ids: list.map((p:any)=>p.id) }), timeoutMs: 60_000,
        });
      } catch {}

      const home = list.find((p:any)=>/home|accueil/i.test(p?.title) || p?.slug==="home" || p?.is_front_page) ?? list[0];
      if (home) {
        try {
          await tw(`/v1/builder/websites/${website_id}/pages/front/set`, {
            method: "POST", body: JSON.stringify({ page_id: home.id }), timeoutMs: 30_000,
          });
        } catch {}
      }

      let preview_url: string | null = null, admin_url: string | null = null;
      try {
        const dn = await tw(`/v1/hosting/websites/${website_id}/domain-name`, { method:"GET", timeoutMs:30_000 });
        preview_url = dn?.data?.default_domain_url || dn?.data?.site_url || null;
        admin_url = dn?.data?.admin_url || null;
      } catch {}
      return J(200, { ok: true, preview_url, admin_url });
    } catch {}
    await new Promise(r => setTimeout(r, 3000));
  }
  return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing" });
};

// update-design (store-only)
const handleUpdateDesign = async (body: any) => {
  const siteId = body?.siteId;
  const design = body?.design ?? {};
  if (!siteId || !design) return J(400, { code: "BAD_REQUEST", error: "Missing siteId or design" });
  try {
    await supabase.from("sites").update({
      colors: design.colors ?? null,
      fonts: design.fonts ?? null,
      pages_meta: design.pages_meta ?? null,
      seo_title: design.seo?.title ?? null,
      seo_description: design.seo?.description ?? null,
      seo_keyphrase: design.seo?.keyphrase ?? null,
      website_type: design.website_type ?? null,
      updated_at: new Date().toISOString(),
    }).eq("website_id", siteId);
  } catch {}
  return J(200, { ok: true });
};

// server
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors() });
  let body: any = {};
  try { if (req.method === "POST") body = await req.json(); } catch {}

  const url = new URL(req.url);
  const action = (url.searchParams.get("action") || body?.action || "").toString().trim().toLowerCase();

  if (req.method === "GET" && action === "health")
    return J(200, { status: "healthy", version: VERSION, ts: new Date().toISOString() });

  if (req.method !== "POST") return J(405, { code: "METHOD_NOT_ALLOWED" });

  if (action === "create-website") return handleCreateWebsite(body);
  if (action === "generate-sitemap") return handleGenerateSitemap(body);
  if (action === "generate-from-sitemap") return handleGenerateFromSitemap(body);
  if (action === "publish-and-frontpage") return handlePublishAndFrontpage(body);
  if (action === "update-design") return handleUpdateDesign(body);

  return J(404, { code: "NOT_FOUND" });
});