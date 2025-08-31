import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://eilpazegjrcrwgpujqni.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4"
);

type InvokeOpts = { 
  method?: "GET"|"POST"|"PUT"|"PATCH"|"DELETE"; 
  query?: Record<string, string|number|boolean>; 
  body?: unknown; 
};

export async function tenwebFetch(path: string, opts: InvokeOpts = {}) {
  const { data, error } = await supabase.functions.invoke("tenweb-proxy", {
    body: { path, method: opts.method ?? "GET", query: opts.query ?? {}, body: opts.body ?? null },
  });
  if (error) throw error;
  return data;
}

export async function getVisitors(websiteId: string|number, period: "day"|"week"|"month"|"year"="month") {
  const id = Number(websiteId);
  if (!Number.isFinite(id)) throw new Error("Invalid websiteId");
  return tenwebFetch(`/v1/hosting/websites/${id}/visitors`, { method: "GET", query: { period } });
}