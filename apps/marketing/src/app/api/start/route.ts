import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!anon || !supabaseUrl) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: "Missing environment variables: NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL" 
      }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
    
    const fn = `${supabaseUrl}/functions/v1/ai-router`;

    const flat = await req.json();
    // Ensure we send the exact contract: { action: "create-draft", brief: <flat brief> }
    const body = JSON.stringify({ action: "create-draft", brief: flat });

    const r = await fetch(fn, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "origin": origin,
      },
      body,
    });

    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "content-type": r.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ 
      ok: false, 
      message: "Internal error", 
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "authorization,content-type,x-client-info,apikey",
      Vary: "Origin",
    },
  });
}
