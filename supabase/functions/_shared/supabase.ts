// Supabase client utilities for edge functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createServiceClient() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function insertSiteDraft(draft: {
  subdomain: string;
  region: string;
  brief: Record<string, any>;
  website_id?: string | null;
  status?: string;
  message?: string | null;
}) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('site_drafts')
    .insert({
      subdomain: draft.subdomain,
      region: draft.region,
      brief: draft.brief,
      website_id: draft.website_id || null,
      status: draft.status || 'created',
      message: draft.message || null,
      pages_meta: [],
      colors: {},
      fonts: {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Draft insert failed: ${error.message}`);
  }

  return data;
}

export async function insertSitePerf(perf: {
  site_id: string;
  strategy: 'mobile' | 'desktop';
  analysis_ts: string;
  performance_score: number | null;
  crux: Record<string, any>;
  lhr: Record<string, any>;
}) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('site_perf')
    .insert(perf)
    .select()
    .single();

  if (error) {
    throw new Error(`Site perf insert failed: ${error.message}`);
  }

  return data;
}