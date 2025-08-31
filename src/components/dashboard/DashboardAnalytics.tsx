import { useAnalytics } from "../../hooks/useAnalytics";

interface DashboardAnalyticsProps {
  websiteId?: string | number;
}

export default function DashboardAnalytics({ websiteId }: DashboardAnalyticsProps) {
  if (!websiteId) {
    return <div className="text-sm text-muted-foreground">Select a site to see analytics.</div>;
  }

  const { data, loading, error } = useAnalytics(websiteId, "week");
  
  if (loading) return <div>Loading analytics…</div>;
  if (error) return <div className="text-red-600">Analytics unavailable. Try again later.</div>;
  if (!data) return <div>No data.</div>;

  return <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
}