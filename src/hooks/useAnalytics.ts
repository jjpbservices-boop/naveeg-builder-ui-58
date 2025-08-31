import { useEffect, useRef, useState } from "react";
import { getSupabase } from "../lib/supabase";

export function useAnalytics(websiteId?: number, period: "day"|"week"|"month"|"year" = "week") {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflight = useRef(false);
  const lastKey = useRef<string | null>(null);
  const coolUntil = useRef<number>(0);

  useEffect(() => {
    if (!websiteId) return;

    const key = `${websiteId}:${period}`;
    if (lastKey.current === key && (data || loading)) return; // dedupe
    lastKey.current = key;

    // backoff window after 429
    if (Date.now() < coolUntil.current) {
      setError("rate_limited");
      return;
    }

    let cancelled = false;
    const run = async () => {
      if (inflight.current) return;
      inflight.current = true;
      setLoading(true);
      setError(null);

      const supabase = getSupabase();
      const invoke = async () =>
        supabase.functions.invoke("tenweb-proxy", {
          body: {
            path: `/v1/hosting/websites/${Number(websiteId)}/visitors`,
            method: "GET",
            query: { period },
          },
        });

      try {
        // single retry with small delay if 429
        let { data: res, error: err } = await invoke();
        if (err && (err as any).status === 429) {
          await new Promise(r => setTimeout(r, 1500));
          ({ data: res, error: err } = await invoke());
        }

        if (cancelled) return;

        if (err) {
          const st = (err as any).status;
          if (st === 429) {
            coolUntil.current = Date.now() + 60_000; // cool down 60s
            setError("rate_limited");
          } else {
            setError((err as any).message ?? "error");
          }
          setLoading(false);
          inflight.current = false;
          return;
        }

        setData(res);
        setLoading(false);
        inflight.current = false;
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "error");
          setLoading(false);
          inflight.current = false;
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, [websiteId, period]);

  return { data, loading, error };
}