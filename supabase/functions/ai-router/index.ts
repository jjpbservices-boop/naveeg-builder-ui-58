// supabase/functions/ai-router/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const VERSION = "v-shortpoll-strict-1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const API_BASE = Deno.env.get("TENWEB_API_BASE") ?? "https://api.10web.io";
const API_KEY = Deno.env.get("TENWEB_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS
const cors = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-api-key, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
});
const J = (code: number, data: unknown) =>
  new Response(JSON.stringify(data), { status: code, headers: { "content-type": "application/json", ...cors() } });

// 10Web helper
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
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) throw { status: res.status, json, raw: text };
    return json;
  } finally { clearTimeout(id); }
};

// utils
const pick = (src: any, keys: string[]) => {
  const out: any = {};
  for (const k of keys) if (src?.[k] !== undefined) out[k] = src[k];
  return out;
};
const need = (obj: any, key: string) => obj?.[key] !== undefined && obj[key] !== null && obj[key] !== "";

// handlers (only the two relevant to your flow kept strict)
const handleGenerateFromSitemap = async (body: any) => {
  const website_id = body?.website_id;
  const unique_id = body?.unique_id || body?.sitemap_unique_id;
  const params = body?.params ?? {};

  if (!website_id || !unique_id) return J(400, { code: "BAD_REQUEST", error: "Missing website_id or unique_id" });

  // strict whitelist
  const allowed = [
    "business_type",
    "business_name",
    "business_description",
    "colors",
    "fonts",
    "pages_meta",
    "website_description",
    "website_keyphrase",
    "website_title",
    "website_type",
  ];
  const clean = pick(params, allowed);

  // required fields
  const required = ["business_type", "business_name", "business_description", "pages_meta", "website_description", "website_keyphrase", "website_title"];
  for (const k of required) {
    if (!need(clean, k)) return J(422, { code: "VALIDATION_ERROR", details: [{ message: `"params.${k}" is required`, path: ["params", k] }] });
  }
  if (!Array.isArray(clean.pages_meta) || clean.pages_meta.length === 0) {
    return J(422, { code: "VALIDATION_ERROR", details: [{ message: `"params.pages_meta" must be a non-empty array`, path: ["params", "pages_meta"] }] });
  }

  // kick off generation (≤25s)
  try {
    await tw("/v1/ai/generate_site_from_sitemap", {
      method: "POST",
      body: JSON.stringify({ website_id, unique_id, params: clean }),
      timeoutMs: 25_000,
    });
  } catch (e: any) {
    if (e?.status === 422 && e?.json?.error?.details) {
      return J(422, { code: "VALIDATION_ERROR", details: e.json.error.details });
    }
    const msg = JSON.stringify(e?.json || e?.raw || "");
    if (![417, 504].includes(e?.status ?? 0) && !/in progress/i.test(msg) && e?.name !== "AbortError") {
      return J(502, { code: "GENERATE_FAILED", detail: e?.json || e?.raw || String(e) });
    }
  }

  // short poll 30s then return in_progress
  const deadline = Date.now() + 30_000;
  let wait = 2000;
  while (Date.now() < deadline) {
    try {
      const pages = await tw(`/v1/builder/websites/${website_id}/pages`, { method: "GET", timeoutMs: 10_000 });
      const list = Array.isArray(pages?.data) ? pages.data : [];
      if (list.length > 0) return J(200, { ok: true, pages_count: list.length });
    } catch {}
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.min(wait + 1000, 6000);
  }
  return J(200, { ok: false, in_progress: true });
};

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
          method: "POST",
          body: JSON.stringify({ page_ids: list.map((p: any) => p.id) }),
          timeoutMs: 60_000,
        });
      } catch {}

      const home = list.find((p: any) => /home|accueil/i.test(p?.title) || p?.slug === "home" || p?.is_front_page) ?? list[0];
      if (home) {
        try {
          await tw(`/v1/builder/websites/${website_id}/pages/front/set`, {
            method: "POST",
            body: JSON.stringify({ page_id: home.id }),
            timeoutMs: 30_000,
          });
        } catch {}
      }

      let preview_url: string | null = null;
      let admin_url: string | null = null;
      try {
        const dn = await tw(`/v1/hosting/websites/${website_id}/domain-name`, { method: "GET", timeoutMs: 30_000 });
        preview_url = dn?.data?.default_domain_url || dn?.data?.site_url || null;
        admin_url = dn?.data?.admin_url || null;
      } catch {}
      return J(200, { ok: true, preview_url, admin_url });
    } catch {}
    await new Promise(r => setTimeout(r, 3000));
  }
  return J(504, { code: "PUBLISH_RETRY", hint: "Still finalizing" });
};

// server
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors() });

  let body: any = {};
  try { if (req.method === "POST") body = await req.json(); } catch {}

  const url = new URL(req.url);
  const action = (url.searchParams.get("action") || body?.action || "").toString().trim().toLowerCase();

  if (req.method === "GET" && action === "health") {
    return J(200, { status: "healthy", version: VERSION, ts: new Date().toISOString() });
  }
  if (req.method !== "POST") return J(405, { code: "METHOD_NOT_ALLOWED" });

  if (action === "generate-from-sitemap") return handleGenerateFromSitemap(body);
  if (action === "publish-and-frontpage") return handlePublishAndFrontpage(body);

  return J(404, { code: "NOT_FOUND" });
});