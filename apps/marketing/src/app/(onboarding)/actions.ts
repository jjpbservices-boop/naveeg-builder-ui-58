"use server";

// Minimal RPC to ai-router
const FN  = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-router`;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Always set Origin so CORS allow-list works in dev
async function callRouter(body: unknown) {
  const r = await fetch(FN, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      Origin: "http://localhost:4311",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`ai-router ${r.status}: ${t}`);
  }
  return r.json();
}

// Load a draft for /design
export async function loadDesign(draftId: string) {
  const res = await callRouter({ action: "get-draft", draft_id: draftId });
  // expect { ok:true, data:{...} }
  if (!res?.ok) throw new Error(res?.message ?? "get-draft failed");
  return res.data;
}

// Save sitemap/colors/fonts
export async function saveDesign(input: {
  draft_id: string;
  pages_meta: any[];
  colors: Record<string, any>;
  fonts: Record<string, any>;
}) {
  const res = await callRouter({ action: "save-draft", ...input });
  if (!res?.ok) throw new Error(res?.message ?? "save-draft failed");
  return res.data;
}
