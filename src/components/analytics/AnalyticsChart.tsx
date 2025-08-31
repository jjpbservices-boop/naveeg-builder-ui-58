import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface AnalyticsChartProps {
  data: any;
  period: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, period }) => {
  const { t } = useTranslation('analytics');
  
  if (!data || !data.daily_stats) return null;

  // Transform data for the chart
  const chartData = data.daily_stats.map((stat: any, index: number) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    visitors: stat.visitors || 0,
    pageViews: stat.page_views || 0
  }));

  const chartConfig = {
    visitors: {
      label: t('kpis.visitors'),
      color: "hsl(var(--chart-1))",
    },
    pageViews: {
      label: t('kpis.pageViews'),
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t('charts.visitorsOverTime')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="var(--color-visitors)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-visitors)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t('charts.pageViewsOverTime')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="var(--color-pageViews)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-pageViews)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};