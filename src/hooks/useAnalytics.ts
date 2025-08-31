import { useEffect, useState } from "react";
import { getVisitors } from "../lib/tenweb";

export function useAnalytics(websiteId?: string | number, period: "day"|"week"|"month"|"year" = "month") {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!websiteId) return;          // do nothing until id exists
    let active = true;
    setLoading(true);
    setError(null);
    getVisitors(websiteId, period)
      .then((res) => { if (active) setData(res); })
      .catch((e) => { if (active) setError(e); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [websiteId, period]);

  return { data, loading, error };
}