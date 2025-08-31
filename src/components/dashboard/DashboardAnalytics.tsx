import React from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

type TenwebVisitors = {
  status: "ok";
  data: { date: string; count: number }[];
  start_date: string;
  end_date: string;
  sum: number;
};

export default function DashboardAnalytics({ websiteId }: { websiteId: number }) {
  const [period, setPeriod] = React.useState<"day"|"week"|"month"|"year">("week");
  const { data, loading, error } = useAnalytics(websiteId, period);

  if (!websiteId) return <>Select a site to see analytics.</>;
  if (loading) return <>Loading…</>;
  if (error === "rate_limited") return <div className="text-red-600">Analytics temporarily rate limited.</div>;
  if (error) return <>Analytics unavailable. Try again later.</>;
  if (!data) return <>No data.</>;

  const v = data as TenwebVisitors;
  const rows = (v.data ?? []).map((d) => ({ date: d.date, visitors: d.count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="day">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm opacity-70">Total visitors</div>
          <div className="text-2xl font-semibold">{v.sum ?? 0}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm opacity-70">Start</div>
          <div className="text-lg">{v.start_date}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm opacity-70">End</div>
          <div className="text-lg">{v.end_date}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm opacity-70">Status</div>
          <div className="text-lg">{v.status}</div>
        </div>
      </div>

      <div className="border rounded">
        <div className="px-4 py-2 font-medium border-b">Visitors by date</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Visitors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} className="border-t">
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">{r.visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}