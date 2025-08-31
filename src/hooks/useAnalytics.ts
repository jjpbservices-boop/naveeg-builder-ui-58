import { useEffect, useRef, useState } from "react";
import { getSupabase } from "../lib/supabase";

type Period = "day" | "week" | "month" | "year";

const PENDING = new Map<string, Promise<any>>();
const LAST_GOOD = new Map<string, any>();
const COOLDOWN_UNTIL = new Map<string, number>();

export function useAnalytics(websiteId?: number, period: Period = "month") {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    if (!websiteId) return;

    const key = `${websiteId}:${period}`;
    const now = Date.now();
    const cool = COOLDOWN_UNTIL.get(key) ?? 0;

    // If cooling down, surface last good immediately
    if (now < cool) {
      if (LAST_GOOD.has(key)) setData(LAST_GOOD.get(key));
      setError("rate_limited");
      return;
    }

    // Serve last good instantly while fetching
    if (LAST_GOOD.has(key)) setData(LAST_GOOD.get(key));

    const invoke = async () => {
      const supabase = getSupabase();
      return supabase.functions.invoke("tenweb-proxy", {
        body: {
          path: `/v1/hosting/websites/${Number(websiteId)}/visitors`,
          method: "GET",
          query: { period },
        },
      });
    };

    // Coalesce multiple callers / StrictMode remounts
    if (!PENDING.has(key)) {
      PENDING.set(key, (async () => {
        // one light retry on 429
        let { data: res, error: err }: any = await invoke();
        if (err && (err.status === 429)) {
          await new Promise(r => setTimeout(r, 1500));
          ({ data: res, error: err } = await invoke());
        }
        return { res, err };
      })().finally(() => PENDING.delete(key)));
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { res, err }: any = await PENDING.get(key)!;
        if (!mounted.current) return;

        if (err && err.status === 429) {
          // fixed 60s unless function passed a retry_after in error.message/body
          // supabase.functions.invoke hides body; use fixed 60s fallback
          const retryMs = 60_000;
          COOLDOWN_UNTIL.set(key, Date.now() + retryMs);
          if (LAST_GOOD.has(key)) setData(LAST_GOOD.get(key)); // show cached
          setError("rate_limited");
          setLoading(false);
          return;
        }

        if (err) {
          setError(err.message ?? "error");
          setLoading(false);
          return;
        }

        // Success (includes stale-from-proxy which still returns 200)
        LAST_GOOD.set(key, res);
        setData(res);
        setLoading(false);
      } catch (e: any) {
        if (!mounted.current) return;
        setError(e?.message ?? "error");
        setLoading(false);
      }
    })();
  }, [websiteId, period]);

  return { data, loading, error };
}