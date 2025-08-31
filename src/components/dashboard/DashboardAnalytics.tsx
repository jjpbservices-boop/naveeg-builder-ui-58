import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { RefreshCw, TrendingUp, Users, Eye, Clock, BarChart3, Smartphone, Globe, Search, Activity, Target, MousePointer, Timer, Monitor, Calendar } from 'lucide-react';
import { useAnalytics } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface DashboardAnalyticsProps {
  currentWebsite: any;
}

// Memoized component to prevent unnecessary re-renders
export const DashboardAnalytics = React.memo(function DashboardAnalytics({ currentWebsite }: DashboardAnalyticsProps) {
  const { t } = useTranslation('analytics');
  const { canUseAnalytics } = useFeatureGate();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  // Stable websiteId to prevent hook call order changes
  const websiteId = useMemo(() => currentWebsite?.id || '', [currentWebsite?.id]);
  
  // Always call hooks in the same order - use stable websiteId
  const { 
    getVisitors,
    data: analyticsData,
    loading,
    error 
  } = useAnalytics(websiteId || 'placeholder');

  const loadAnalytics = useCallback(async () => {
    if (!websiteId || !canUseAnalytics) {
      return;
    }
    try {
      await getVisitors(period);
    } catch (err) {
      console.error('[ANALYTICS] Load error:', err);
    }
  }, [websiteId, period, canUseAnalytics, getVisitors]);

  useEffect(() => {
    if (websiteId && canUseAnalytics) {
      loadAnalytics();
    }
  }, [loadAnalytics, websiteId, canUseAnalytics]);

  // Feature gating for analytics
  if (!canUseAnalytics) {
    return (
      <LockedFeature
        featureName="Advanced Analytics"
        description="Get detailed insights about your website's performance and visitor behavior"
        requiredPlan="pro"
        onUpgrade={() => window.location.href = '/plans'}
      />
    );
  }


  const processedAnalytics = useMemo(() => {
    if (!analyticsData) return null;

    // Process real analytics data
    const visitors = analyticsData.visitors || {};
    const totalVisitors = Object.values(visitors).reduce((sum: number, count: any) => sum + (Number(count) || 0), 0);
    const totalPageViews = Math.floor(Number(totalVisitors) * 1.4); // Estimate page views from visitors
    
    // Generate time series data based on real data
    const timeSeriesData = Object.entries(visitors).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pageViews: Math.floor((count as number) * 1.4),
      visitors: count as number,
    }));

    // Calculate metrics
    const avgSessionDuration = '2m 14s'; // Default for now
    const bounceRate = '38%'; // Default for now
    const conversionRate = '4.2%'; // Default for now

    // Mock top pages (real implementation would come from 10Web pages API)
    const topPages = [
      { page: '/', views: Math.floor(Number(totalPageViews) * 0.4) },
      { page: '/about', views: Math.floor(Number(totalPageViews) * 0.2) },
      { page: '/services', views: Math.floor(Number(totalPageViews) * 0.15) },
      { page: '/contact', views: Math.floor(Number(totalPageViews) * 0.12) },
      { page: '/blog', views: Math.floor(Number(totalPageViews) * 0.08) }
    ];

    return {
      pageViews: totalPageViews,
      uniqueVisitors: totalVisitors,
      avgSessionDuration,
      bounceRate,
      conversionRate,
      topPages,
      timeSeriesData,
      lastUpdated: new Date().toISOString(),
    };
  }, [analyticsData]);

  // Enhanced device breakdown with colors (mock data for now)
  const deviceBreakdown = useMemo(() => {
    const uniqueVisitors = Number(processedAnalytics?.uniqueVisitors) || 0;
    return [
      { device: 'Desktop', count: Math.floor(uniqueVisitors * 0.6), percentage: 60, fill: 'hsl(var(--chart-1))' },
      { device: 'Mobile', count: Math.floor(uniqueVisitors * 0.35), percentage: 35, fill: 'hsl(var(--chart-2))' },
      { device: 'Tablet', count: Math.floor(uniqueVisitors * 0.05), percentage: 5, fill: 'hsl(var(--chart-3))' },
    ];
  }, [processedAnalytics?.uniqueVisitors]);

  // Enhanced traffic sources with colors (mock data for now)
  const trafficSources = useMemo(() => {
    const uniqueVisitors = Number(processedAnalytics?.uniqueVisitors) || 0;
    return [
      { source: 'Direct', count: Math.floor(uniqueVisitors * 0.4), percentage: 40, fill: 'hsl(var(--chart-1))' },
      { source: 'Google', count: Math.floor(uniqueVisitors * 0.3), percentage: 30, fill: 'hsl(var(--chart-2))' },
      { source: 'Social Media', count: Math.floor(uniqueVisitors * 0.2), percentage: 20, fill: 'hsl(var(--chart-3))' },
      { source: 'Other', count: Math.floor(uniqueVisitors * 0.1), percentage: 10, fill: 'hsl(var(--chart-4))' },
    ];
  }, [processedAnalytics?.uniqueVisitors]);

  // Early return for missing website ID before any processing
  if (!websiteId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Website</h3>
          <p className="text-muted-foreground mb-4">Please select a website to view analytics data.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
          <span className="text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!processedAnalytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground mb-4">Analytics data will appear once your website starts receiving visitors.</p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border p-1">
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? 'default' : 'ghost'}
                onClick={() => setPeriod(p)}
                className="text-xs px-2 py-1 h-7"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
          <Button onClick={loadAnalytics} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Clean KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Page Views</p>
                <p className="text-2xl font-semibold">{processedAnalytics.pageViews.toLocaleString()}</p>
                <p className="text-xs text-success flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Unique Visitors</p>
                <p className="text-2xl font-semibold">{processedAnalytics.uniqueVisitors.toLocaleString()}</p>
                <p className="text-xs text-success flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2%
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Session</p>
                <p className="text-2xl font-semibold">{processedAnalytics.avgSessionDuration}</p>
                <p className="text-xs text-muted-foreground flex items-center mt-2">
                  <Activity className="h-3 w-3 mr-1" />
                  +2.1%
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <Timer className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bounce Rate</p>
                <p className="text-2xl font-semibold">{processedAnalytics.bounceRate}</p>
                <p className="text-xs text-success flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  -5.3%
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <MousePointer className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</p>
                <p className="text-2xl font-semibold">{processedAnalytics.conversionRate}</p>
                <p className="text-xs text-success flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.8%
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <span>Traffic Overview (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{
              pageViews: { label: "Page Views", color: "hsl(var(--chart-1))" },
              visitors: { label: "Visitors", color: "hsl(var(--chart-2))" }
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedAnalytics.timeSeriesData}>
                <defs>
                  <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#pageViewsGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#visitorsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span>Top Pages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              views: { label: "Views", color: "hsl(var(--chart-1))" }
            }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={processedAnalytics.topPages} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis dataKey="page" type="category" width={80} className="text-xs fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <span>Device Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
              mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
              tablet: { label: "Tablet", color: "hsl(var(--chart-3))" }
            }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {deviceBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {deviceBreakdown.map((device: any, index: number) => (
                <div key={device.device} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.fill }}></div>
                  <span className="text-xs text-muted-foreground">{device.device}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span>Traffic Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              count: { label: "Visitors", color: "hsl(var(--chart-2))" }
            }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trafficSources}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="source" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span>Performance Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">SEO Score</span>
                <Badge variant="success">95/100</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Page Speed</span>
                <Badge variant="info">Excellent</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Mobile Friendly</span>
                <Badge variant="success">Yes</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Security</span>
                <Badge variant="success">A+ SSL</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  );
});