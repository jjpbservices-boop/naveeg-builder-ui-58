import { supabase } from "@/integrations/supabase/client";

type InvokeOpts = {
  method?: "GET"|"POST"|"PUT"|"PATCH"|"DELETE";
  query?: Record<string, string | number | boolean>;
  body?: unknown;
};

export async function tenwebFetch(path: string, opts: InvokeOpts = {}) {
  const { data, error } = await supabase.functions.invoke("tenweb-proxy", {
    body: { path, method: opts.method ?? "GET", query: opts.query ?? {}, body: opts.body ?? null },
  });
  if (error) throw error;
  return data;
}

// Analytics endpoint. website_id is a PATH param in 10Web docs.
export async function getVisitors(websiteId: string | number, period: "day"|"week"|"month"|"year" = "month") {
  const id = Number(websiteId);
  if (!Number.isFinite(id)) throw new Error("Invalid websiteId");
  return tenwebFetch(`/v1/hosting/websites/${id}/visitors`, { method: "GET", query: { period } });
}