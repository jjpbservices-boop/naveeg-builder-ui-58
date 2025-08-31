import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";

type Website = { 
  website_id?: number | null;
  tenweb_website_id?: number | null;
};

export default function DashboardAnalytics({ website }: { website?: Website }) {
  const id = website?.website_id || website?.tenweb_website_id;
  const [state, setState] = useState<{loading:boolean; error?:string; data?:any}>({loading:false});

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      setState({ loading: true });
      const supabase = getSupabase();
      const { data, error } = await supabase.functions.invoke("tenweb-proxy", {
        body: {
          path: `/v1/hosting/websites/${Number(id)}/visitors`,
          method: "GET",
          query: { period: "week" },
        },
      });
      if (error) setState({ loading: false, error: error.message });
      else setState({ loading: false, data });
    };
    run();
  }, [id]);

  if (!id) return <div className="text-sm text-muted-foreground">Select a site.</div>;
  if (state.loading) return <div>Loading analytics…</div>;
  if (state.error) return <div className="text-red-600">Analytics unavailable. Try again later.</div>;
  if (!state.data) return <div>No data.</div>;
  return <pre className="text-xs">{JSON.stringify(state.data, null, 2)}</pre>;
}