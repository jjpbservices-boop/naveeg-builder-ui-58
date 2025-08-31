import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Eye, Clock, Target } from "lucide-react";

interface AnalyticsKPIProps {
  data: any;
}

export const AnalyticsKPI: React.FC<AnalyticsKPIProps> = ({ data }) => {
  const { t } = useTranslation('analytics');
  
  if (!data) return null;

  // Extract key metrics from the data
  const visitors = data.total_visitors || 0;
  const pageViews = data.total_page_views || 0;
  const bounceRate = data.bounce_rate || 0;
  const avgTimeOnSite = data.avg_time_on_site || 0;

  // Calculate percentage changes (mock data for now)
  const visitorsChange = data.visitors_change || 0;
  const pageViewsChange = data.page_views_change || 0;

  const kpis = [
    {
      title: t('kpis.visitors'),
      value: visitors.toLocaleString(),
      change: visitorsChange,
      icon: Users,
      color: "text-chart-1"
    },
    {
      title: t('kpis.pageViews'),
      value: pageViews.toLocaleString(),
      change: pageViewsChange,
      icon: Eye,
      color: "text-chart-2"
    },
    {
      title: t('kpis.bounceRate'),
      value: `${bounceRate.toFixed(1)}%`,
      change: -2.3,
      icon: Target,
      color: "text-chart-3"
    },
    {
      title: t('kpis.timeOnSite'),
      value: `${Math.floor(avgTimeOnSite / 60)}:${(avgTimeOnSite % 60).toString().padStart(2, '0')}`,
      change: 15.2,
      icon: Clock,
      color: "text-chart-4"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change > 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendIcon className={`h-3 w-3 mr-1 ${isPositive ? 'text-success' : 'text-error'}`} />
                <span className={isPositive ? 'text-success' : 'text-error'}>
                  {Math.abs(kpi.change)}%
                </span>
                <span className="ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};