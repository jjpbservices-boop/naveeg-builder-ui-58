// src/lib/api.ts
const BASE = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const FN = `${BASE}/functions/v1/ai-router`;

const HEADERS: Record<string, string> = {
  accept: "application/json",
  "content-type": "application/json",
  apikey: ANON,
  Authorization: `Bearer ${ANON}`,
};

// exact-schema builder
export function buildStrictParams(input: {
  business_type: string;
  business_name: string;
  business_description: string;
  colors?: { background_dark?: string; primary_color?: string; secondary_color?: string };
  fonts?: { primary_font?: string };
  pages_meta: Array<{ title: string; description?: string; sections?: Array<{ section_title: string; section_description?: string }> }>;
  website_description: string;
  website_keyphrase: string;
  website_title: string;
  website_type?: string;
}) {
  const required = ["business_type","business_name","business_description","website_description","website_keyphrase","website_title"] as const;
  for (const k of required) if (!(input as any)[k]) throw new Error(`Missing required param: ${k}`);
  if (!Array.isArray(input.pages_meta) || input.pages_meta.length === 0) throw new Error("Missing required param: pages_meta");

  const out: any = {
    business_type: input.business_type,
    business_name: input.business_name,
    business_description: input.business_description,
    pages_meta: input.pages_meta.map(p => ({
      title: p.title,
      ...(p.description ? { description: p.description } : {}),
      ...(Array.isArray(p.sections) && p.sections.length
        ? { sections: p.sections.map(s => ({
            section_title: s.section_title,
            ...(s.section_description ? { section_description: s.section_description } : {}),
          })) }
        : {}),
    })),
    website_description: input.website_description,
    website_keyphrase: input.website_keyphrase,
    website_title: input.website_title,
  };
  if (input.colors) out.colors = input.colors;
  if (input.fonts?.primary_font) out.fonts = { primary_font: input.fonts.primary_font };
  if (input.website_type) out.website_type = input.website_type;
  return out;
}

async function req(action: string, payload: Record<string, any>, timeout = 65_000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(FN + `?action=${encodeURIComponent(action)}`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ action, ...payload }),
      signal: ctl.signal,
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err: any = new Error(json?.code || res.statusText || "Request failed");
      err.status = res.status; err.code = json?.code; err.detail = json; throw err;
    }
    return json;
  } catch (e: any) {
    if (e.name === "AbortError") { const x: any = new Error("CLIENT_TIMEOUT"); x.code = "CLIENT_TIMEOUT"; x.status = 408; throw x; }
    throw e;
  } finally { clearTimeout(t); }
}

export const api = {
  // design save
  updateDesign: (siteId: number, design: any) =>
    req("update-design", { siteId, design }, 30_000),

  // one-shot generate
  generateFromOnce: (website_id: number, unique_id: string, params: any) =>
    req("generate-from-sitemap", { website_id, unique_id, params }, 65_000),

  // polling loop
  generateFromWithPolling: async (website_id: number, unique_id: string, params: any) => {
    const loops = 50;
    for (let i = 0; i < loops; i++) {
      try {
        const res = await api.generateFromOnce(website_id, unique_id, params);
        if (res?.ok && res?.pages_count > 0) return res;
        await new Promise(r => setTimeout(r, 2500));
      } catch (e: any) {
        if (e.code === "CLIENT_TIMEOUT") { await new Promise(r => setTimeout(r, 2500)); continue; }
        throw e;
      }
    }
    throw new Error("Generation timeout after polling");
  },

  publishAndFrontWithPolling: async (website_id: number) => {
    const attempts = 6, perAttempt = 180_000;
    for (let i = 0; i < attempts; i++) {
      try { return await req("publish-and-frontpage", { website_id }, perAttempt); }
      catch (e: any) {
        if (e.code === "CLIENT_TIMEOUT" && i < attempts - 1) { await new Promise(r => setTimeout(r, 5000)); continue; }
        throw e;
      }
    }
    throw new Error("Publishing timeout");
  },
};

// named export for existing imports
export const updateDesign = api.updateDesign;