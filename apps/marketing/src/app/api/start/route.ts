import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const { business_type, business_name, business_description, preferred_subdomain } =
      await req.json();

    // quick, forgiving validation
    if (!business_type || !business_name || !business_description) {
      return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:4311";

    const sb = createClient(url, anon);
    const { data, error } = await sb.functions.invoke("ai-router", {
      body: {
        action: "create-website",
        brief: {
          business_type,
          business_name,
          business_description,
          preferred_subdomain: preferred_subdomain?.trim() || null,
        },
      },
      headers: { origin }, // <-- important: pass Origin through
    });

    if (error) {
      // Bubble up function error with details for debugging
      return NextResponse.json(
        { ok: false, message: error.message ?? "Function error", details: error },
        { status: 400 }
      );
    }

    if (!data?.ok) {
      return NextResponse.json(
        { ok: false, message: data?.message ?? "Function returned an error", details: data },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, ...data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
