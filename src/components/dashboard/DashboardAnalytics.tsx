import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "../../hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodSelector } from "../analytics/PeriodSelector";
import { AnalyticsKPI } from "../analytics/AnalyticsKPI";
import { AnalyticsChart } from "../analytics/AnalyticsChart";
import { AnalyticsError } from "../analytics/AnalyticsError";
import { AnalyticsEmpty } from "../analytics/AnalyticsEmpty";

type Website = { 
  website_id?: number | null;
  tenweb_website_id?: number | null;
};

type Period = "day" | "week" | "month" | "year";

export default function DashboardAnalytics({ website }: { website?: Website }) {
  const { t } = useTranslation('analytics');
  const [period, setPeriod] = useState<Period>("month");
  
  const id = website?.website_id || website?.tenweb_website_id;
  const { data, loading, error } = useAnalytics(id || undefined, period);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!id) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Select a website to view analytics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && error !== "rate_limited") {
    return <AnalyticsError error={error} onRetry={handleRetry} />;
  }

  if (!data || (data.total_visitors === 0 && data.total_page_views === 0)) {
    return <AnalyticsEmpty />;
  }

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Rate limit warning */}
      {error === "rate_limited" && (
        <AnalyticsError error={error} onRetry={handleRetry} />
      )}

      {/* KPI Cards */}
      <AnalyticsKPI data={data} />

      {/* Charts */}
      <AnalyticsChart data={data} period={period} />
    </div>
  );
}