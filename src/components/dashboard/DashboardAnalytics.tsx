import { useAnalytics } from "../../hooks/useAnalytics";

type Website = { 
  website_id?: number | null;
  tenweb_website_id?: number | null;
};

export default function DashboardAnalytics({ website }: { website?: Website }) {
  const id = website?.website_id || website?.tenweb_website_id;
  const { data, loading, error } = useAnalytics(id || undefined, "week");

  if (!id) return <div className="text-sm text-muted-foreground">Select a site.</div>;
  if (loading) return <div>Loading analytics…</div>;
  if (error === "rate_limited") return <div className="text-red-600">Analytics temporarily rate limited.</div>;
  if (error) return <div className="text-red-600">Analytics unavailable. Try again later.</div>;
  if (!data) return <div>No data.</div>;
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}