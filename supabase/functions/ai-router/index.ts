// supabase/functions/ai-router/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// ENV
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const API_BASE = Deno.env.get("TENWEB_API_BASE") ?? "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS (always present)
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, x-api-key, content-type, x-client-info, x-requested-with",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
});
const J = (code: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status: code,
    headers: { "content-type": "application/json", ...corsHeaders() },
  });

// 10Web fetch
type TwInit = RequestInit & { timeoutMs?: number };
const tw = async (path: string, init: TwInit = {}) => {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), init.timeoutMs ?? 90_000);
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Supabase-Edge-Function/1.0",
      "x-api-key": API_KEY,
      ...(init.headers as Record<string, string> | undefined),
    };
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: ctl.signal, headers });
    const txt = await res.text();
    let json: any = null;
    try { json = txt ? JSON.parse(txt) : null; } catch {}
    if (!res.ok) throw { status: res.status, json, raw: txt };
    return json;
  } finally { clearTimeout(id); }
};

// utils
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
  try {
    await tw("/v1/hosting/websites/subdomain/check",{method:"POST",body:JSON.stringify({subdomain:base}),timeoutMs:10_000});
    return base;
  } catch {}
  for (let i=0;i<18;i++){
    const sub=subCandidate(base,Math.random().toString(36).slice(2,8));
    try{
      await tw("/v1/hosting/websites/subdomain/check",{method:"POST",body:JSON.stringify({subdomain:sub}),timeoutMs:10_000});
      return sub;
    }catch{}
  }
  return subCandidate(base,Date.now().toString(36));
};

// schema helpers
const minimalPagesMeta = (pages_meta: any) => {
  if (!Array.isArray(pages_meta) || pages_meta.length === 0) {
    return [
      { title: "Home", sections: [{ section_title: "Hero" }, { section_title: "About Us" }] },
      { title: "Contact", sections: [{ section_title: "Get In Touch" }] },
    ];
  }
  return pages_meta.map((p: any) => ({
    title: String(p?.title || "Page"),
    sections: Array.isArray(p?.sections) && p.sections.length
      ? p.sections.map((s: any) => ({ section_title: String(s?.section_title || s?.title || "Section") }))
      : [{ section_title: "Section" }],
  }));
};
const normalizeSitemapParams = (raw: any) => {
  const p = { ...(raw || {}) };
  p.business_name = p.business_name || p.businessName || p.site_title || p.brand || "Business";
  p.business_description = p.business_description || p.businessDescription || p.description || "";
  p.business_type = p.business_type || p.businessType || "informational";
  if (p.style?.colors && !p.colors) p.colors = p.style.colors;
  if (p.style?.fonts && !p.fonts) p.fonts = p.style.fonts;
  return {
    business_name: String(p.business_name),
    business_description: String(p.business_description),
    business_type: String(p.business_type),
    colors: p.colors || undefined,
    fonts: p.fonts || undefined,
    locale: p.locale || p.language || undefined,
  };
};
const normalizeGenerationParams = (raw: any, carry: any = {}) => {
  const p = { ...(raw || {}) };
  const business_name = p.business_name || carry.business_name || "Business";
  const business_description = p.business_description || carry.business_description || "Website generated with Naveeg.";
  const business_type = p.business_type || carry.business_type || "informational";
  const website_title = p.website_title || p.seo?.website_title || business_name;
  const website_description = p.website_description || p.seo?.website_description || business_description;
  const website_keyphrase = p.website_keyphrase || p.seo?.website_keyphrase || website_title;
  const pages_meta = minimalPagesMeta(p.pages_meta);
  const website_type = p.website_type || "basic";
  const colors = p.colors || undefined;
  const fonts = p.fonts || undefined;
  // return flat schema 10Web expects
  return { business_name, business_description, business_type,
           website_title, website_description, website_keyphrase,
           website_type, pages_meta, colors, fonts };
};

// handlers
const handleCreateWebsite = async (body: any) => {
  const businessName = (body.businessName || body.business_name || "New Site").toString().trim();
  const base = slugify(businessName);
  const existing = await findBySub(base);
  if (existing) return J(200, { ok: true, website_id: existing.id, subdomain: base, reused: true });

  let candidate = await ensureFreeSub(base);
  const payload = (sub: string, region: string) => ({
    subdomain: sub, region, site_title: businessName,
    admin_username: "admin", admin_password: crypto.randomUUID().replace(/-/g, "").slice(0,16) + "Aa1!",
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
        for(let p=0;p<20;p++){
          await new Promise(r=>setTimeout(r,2000));
          const polled = await findBySub(candidate);
          if (polled) return J(200,{ ok:true, website_id:polled.id, subdomain:candidate, reused:false });
        }
      }
      throw e;
    }
  }
  return J(409,{ code:"SUBDOMAIN_EXHAUSTED" });
};

const handleGenerateSitemap = async (body: any) => {
  const { website_id } = body || {};
  let { params } = body || {};
  if (!website_id || !params) return J(400,{ error:"Missing website_id or params" });

  params = normalizeSitemapParams(params);
  if (!params.business_name || !params.business_description)
    return J(400,{ error:"Missing required params: business_name, business_description" });
  if (!params.business_type) params.business_type = "informational";

  const result = await tw("/v1/ai/generate_sitemap",{
    method:"POST", body:JSON.stringify({ website_id, params }), timeoutMs:120_000
  });

  const pages_meta = minimalPagesMeta(result?.pages_meta);
  const seo = {
    website_title: result?.seo?.website_title || params.business_name,
    website_description: result?.seo?.website_description || params.business_description,
    website_keyphrase: result?.seo?.website_keyphrase || params.business_name,
  };
  const colors = {
    primary_color: result?.colors?.primary_color || "#FF7A00",
    secondary_color: result?.colors?.secondary_color || "#1E62FF",
    background_dark: result?.colors?.background_dark || "#121212",
  };
  const fonts = (result?.fonts && result.fonts.primary_font) ? result.fonts : { primary_font: "Inter" };

  return J(200,{
    unique_id: result?.unique_id || result?.sitemap_unique_id || crypto.randomUUID(),
    pages_meta, seo, colors, fonts,
    website_type: params.business_type === "ecommerce" ? "ecommerce" : "basic",
  });
};

const handleUpdateDesign = async (body: any) => {
  const { siteId, design } = body || {};
  if (!siteId || !design) return J(400,{ error:"Missing siteId or design" });

  const hex = /^#[0-9a-f]{6}$/i;
  const { colors } = design || {};
  if (colors) {
    const { primary_color, secondary_color, background_dark } = colors;
    if (primary_color && !hex.test(primary_color)) return J(400,{ error:"Invalid primary_color format" });
    if (secondary_color && !hex.test(secondary_color)) return J(400,{ error:"Invalid secondary_color format" });
    if (background_dark && !hex.test(background_dark)) return J(400,{ error:"Invalid background_dark format" });
  }

  const { error } = await supabase.from("sites").update({
    colors: design.colors, fonts: design.fonts, pages_meta: design.pages_meta,
    seo_title: design.seo?.title || design.seo?.website_title,
    seo_description: design.seo?.description || design.seo?.website_description,
    seo_keyphrase: design.seo?.keyphrase || design.seo?.website_keyphrase,
    website_type: design.website_type, updated_at: new Date().toISOString(),
  }).eq("website_id", siteId);
  if (error) return J(500,{ error:"Failed to update design" });
  return J(200,{ ok:true });
};

const handleGenerateFromSitemap = async (body: any) => {
  const { website_id } = body || {};
  const unique_id = body?.unique_id || body?.sitemap_unique_id;
  let params = body?.params;
  if (!website_id || !unique_id || !params) return J(400,{ error:"Missing website_id, unique_id, or params" });

  // Build a valid flat params object even if frontend only sent pages_meta
  const norm = normalizeGenerationParams(params, {
    business_name: body?.business_name,
    business_description: body?.business_description,
    business_type: body?.business_type,
  });
  params = {
    business_name: norm.business_name,
    business_description: norm.business_description,
    business_type: norm.business_type,
    website_title: norm.website_title,
    website_description: norm.website_description,
    website_keyphrase: norm.website_keyphrase,
    website_type: norm.website_type,
    pages_meta: norm.pages_meta,
    ...(norm.colors ? { colors: norm.colors } : {}),
    ...(norm.fonts  ? { fonts:  norm.fonts  } : {}),
  };

  // strict validation
  if (!Array.isArray(params.pages_meta) || params.pages_meta.length === 0)
    return J(400,{ code:"MISSING_REQUIRED_PARAMS", error:"pages_meta is empty" });
  for (const k of ["business_name","business_description","business_type","website_title","website_description","website_keyphrase"]) {
    // @ts-ignore
    if (!params[k]) return J(400,{ code:"MISSING_REQUIRED_PARAMS", error:`${k} is required` });
  }

  try {
    await tw("/v1/ai/generate_site_from_sitemap",{
      method:"POST", body:JSON.stringify({ website_id, unique_id, params }), timeoutMs:120_000
    });
  } catch (e: any) {
    if (e?.status === 422 && e?.json?.error?.details)
      return J(422,{ code:"VALIDATION_ERROR", details:e.json.error.details, hint:"Fix params schema" });
    if (![417,504].includes(e?.status ?? 0) && e?.name !== "AbortError")
      return J(502,{ code:"GENERATE_FAILED", detail:e?.json || e?.message || String(e) });
    // else fall through to poll
  }

  // poll for pages
  const deadline = Date.now() + 300_000;
  let wait = 3000;
  while (Date.now() < deadline) {
    try {
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`,{ method:"GET", timeoutMs:30_000 });
      const list = Array.isArray(pages?.data) ? pages.data : [];
      if (list.length > 0) return J(200,{ ok:true, pages_count:list.length });
    } catch {}
    await new Promise(r=>setTimeout(r,wait));
    wait = Math.min(Math.round(wait * 1.5), 10_000);
  }
  return J(504,{ code:"GENERATE_TIMEOUT", hint:"Still processing. Try publish step later." });
};

const handlePublishAndFrontpage = async (body: any) => {
  const { website_id } = body || {};
  if (!website_id) return J(400,{ error:"Missing website_id" });

  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    try {
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`,{ method:"GET", timeoutMs:30_000 });
      const list: any[] = Array.isArray(pages?.data) ? pages.data : [];
      if (list.length === 0) { await new Promise(r=>setTimeout(r,3000)); continue; }

      try {
        await tw(`/v1/builder/websites/${website_id}/pages/publish`,{
          method:"POST", body:JSON.stringify({ page_ids: list.map((p:any)=>p.id) }), timeoutMs:60_000
        });
      } catch (e:any) {
        if (![400,409,422].includes(e?.status ?? 0)) {
          await tw(`/v1/builder/websites/${website_id}/pages/publish`,{
            method:"POST", body:JSON.stringify({ action:"publish", page_ids:list.map((p:any)=>p.id) }), timeoutMs:60_000
          });
        }
      }

      const home = list.find((p:any)=>/home|accueil/i.test(p?.title) || p?.slug==="home" || p?.is_front_page) ?? list[0];
      if (home) {
        try {
          await tw(`/v1/builder/websites/${website_id}/pages/front/set`,{
            method:"POST", body:JSON.stringify({ page_id: home.id }), timeoutMs:30_000
          });
        } catch (e:any) { if (![400,409,422].includes(e?.status ?? 0)) throw e; }
      }

      let preview_url: string | null = null;
      let admin_url: string | null = null;
      try {
        const dn = await tw(`/v1/hosting/websites/${website_id}/domain-name`,{ method:"GET", timeoutMs:30_000 });
        preview_url = dn?.data?.default_domain_url || dn?.data?.site_url || null;
        admin_url = dn?.data?.admin_url || null;
      } catch {}
      if (!preview_url || !admin_url) {
        const acc = await listSites(); const hit = acc?.data?.find?.((w:any)=>w?.id===website_id); const sub = hit?.subdomain;
        preview_url = preview_url || hit?.site_url || (sub ? `https://${sub}.10web.site` : null);
        admin_url = admin_url || hit?.admin_url || (sub ? `https://${sub}.10web.site/wp-admin` : null);
      }
      if (preview_url && admin_url) return J(200,{ ok:true, preview_url, admin_url });
    } catch {}
    await new Promise(r=>setTimeout(r,3000));
  }
  return J(504,{ code:"PUBLISH_RETRY", hint:"Still finalizing after 180s" });
};

// server
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });

  let body: any = {};
  try { if (req.method === "POST") body = await req.json(); } catch {}

  const url = new URL(req.url);
  let action = (url.searchParams.get("action") || body?.action || url.pathname.split("/").pop() || "")
    .toString().trim().toLowerCase();
  const aliases: Record<string,string> = { generate:"generate-from-sitemap", publish:"publish-and-frontpage", sitemap:"generate-sitemap", update:"update-design" };
  action = aliases[action] || action;

  try {
    if (req.method === "GET" && action === "health")
      return J(200,{ status:"healthy", ts:new Date().toISOString(), actions:[
        "create-website","generate-sitemap","generate-from-sitemap","publish-and-frontpage","update-design"
      ]});
    if (req.method === "POST" && !action) return J(400,{ code:"MISSING_ACTION" });

    if (req.method === "POST" && action === "create-website")        return await handleCreateWebsite(body);
    if (req.method === "POST" && action === "generate-sitemap")      return await handleGenerateSitemap(body);
    if (req.method === "POST" && action === "generate-from-sitemap") return await handleGenerateFromSitemap(body);
    if (req.method === "POST" && action === "publish-and-frontpage") return await handlePublishAndFrontpage(body);
    if (req.method === "POST" && action === "update-design")         return await handleUpdateDesign(body);

    return J(404,{ error:"NOT_FOUND", hint:"Use GET ?action=health or POST listed actions" });
  } catch (err: any) {
    return J(err?.status || 500, { code:"UNHANDLED", detail: err?.json || err?.message || String(err) });
  }
});