import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { isOriginAllowed, handlePreflight, json } from "../_shared/cors.ts";
import { PSIClient, extractMetrics } from "../_shared/psi.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || req.headers.get("x-forwarded-origin");

  if (req.method === "OPTIONS") return handlePreflight(req);
  if (!isOriginAllowed(origin)) return json({ ok:false, error:"Origin not allowed" }, origin, 403);
  if (req.method !== "POST")   return json({ ok:false, error:"Method not allowed" }, origin, 405);

  try {
    const PSI_API_KEY = Deno.env.get("PSI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!PSI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json({ ok:false, error:"Server not configured" }, origin, 500);

    const { site_id, url, strategy = "mobile", locale, categories } = await req.json();
    if (!site_id || !url) return json({ ok:false, error:"Missing site_id or url" }, origin, 400);
    if (!["mobile","desktop"].includes(strategy)) return json({ ok:false, error:"Invalid strategy" }, origin, 400);

    const allowedCats = ["PERFORMANCE","ACCESSIBILITY","BEST_PRACTICES","SEO"];
    const cats = (Array.isArray(categories) ? categories : []).filter((c: string) => allowedCats.includes(c));

    const psi = new PSIClient(PSI_API_KEY);
    const resp = await psi.runAuditWithRetry({ url, strategy, locale, categories: cats.length ? cats : undefined });
    const m = extractMetrics(resp);

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await sb.from("site_perf").insert({
      site_id, strategy, analysis_ts: m.analysis_ts, performance_score: m.performance_score, crux: m.crux, lhr: m.lhr,
    }).select().single();
    if (error) return json({ ok:false, error:"Failed to save PSI data" }, origin, 500);

    return json({ ok:true, site_id, strategy, score: m.performance_score, analysis_ts: m.analysis_ts, id: data.id }, origin, 200);
  } catch (e: any) {
    if (String(e?.message || "").toLowerCase().includes("rate limit")) return json({ ok:false, error:"PSI rate limit exceeded" }, origin, 429);
    if (String(e?.message || "").includes("PSI API error")) return json({ ok:false, error:e.message }, origin, 502);
    return json({ ok:false, error:"Internal server error" }, origin, 500);
  }
});