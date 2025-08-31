import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TrendingUp, RefreshCw, Eye, Users, Clock, Zap, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '@/components/LockedFeature';
import { useAnalytics } from '@/hooks/useAnalytics';

interface DashboardAnalyticsProps {
  websiteId?: string | number;
}

export default function DashboardAnalytics({ websiteId }: DashboardAnalyticsProps) {
  const { t } = useTranslation(['dashboard', 'common']);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // Check if user has access to analytics
  const { canUseAnalytics } = useFeatureGate();

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

  if (!websiteId) {
    return <div className="text-sm text-muted-foreground">Select a site to see analytics.</div>;
  }

  const { data, loading, error } = useAnalytics(websiteId, period);

  if (loading) return <div>Loading analytics…</div>;
  if (error) return <div className="text-red-600">Analytics unavailable. Try again later.</div>;
  if (!data) return <div>No data available.</div>;

  // Mock data structure for demonstration
  const mockData = {
    totalVisitors: 1250,
    totalPageViews: 3480,
    avgSessionDuration: 245,
    bounceRate: 32,
    conversionRate: 4.2,
    timeSeriesData: [
      { name: 'Mon', visitors: 180, pageViews: 420 },
      { name: 'Tue', visitors: 220, pageViews: 510 },
      { name: 'Wed', visitors: 190, pageViews: 380 },
      { name: 'Thu', visitors: 270, pageViews: 620 },
      { name: 'Fri', visitors: 240, pageViews: 560 },
      { name: 'Sat', visitors: 160, pageViews: 350 },
      { name: 'Sun', visitors: 180, pageViews: 410 },
    ],
    topPages: [
      { path: '/', views: 850 },
      { path: '/about', views: 320 },
      { path: '/services', views: 280 },
      { path: '/contact', views: 150 },
      { path: '/blog', views: 120 },
    ]
  };

  const deviceBreakdown = [
    { name: 'Desktop', value: 45, color: '#8884d8' },
    { name: 'Mobile', value: 40, color: '#82ca9d' },
    { name: 'Tablet', value: 15, color: '#ffc658' },
  ];

  const trafficSources = [
    { name: 'Direct', value: 340 },
    { name: 'Search', value: 450 },
    { name: 'Social', value: 280 },
    { name: 'Referral', value: 180 },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Website Analytics</h2>
            <p className="text-muted-foreground">Track your website performance and visitor behavior</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground ml-2">Page Views</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{mockData.totalPageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last {period}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground ml-2">Unique Visitors</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{mockData.totalVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last {period}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground ml-2">Avg. Session</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{Math.floor(mockData.avgSessionDuration / 60)}m {mockData.avgSessionDuration % 60}s</div>
                <p className="text-xs text-muted-foreground">+5% from last {period}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground ml-2">Bounce Rate</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{mockData.bounceRate}%</div>
                <p className="text-xs text-muted-foreground">-3% from last {period}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground ml-2">Conversion Rate</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{mockData.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">+15% from last {period}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Traffic Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }} 
                    />
                    <Area type="monotone" dataKey="visitors" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="pageViews" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockData.topPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">{page.path}</span>
                    <Badge variant="secondary">{page.views}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Types */}
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-green-600">98</div>
                <div className="text-sm text-muted-foreground">SEO Score</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-blue-600">1.2s</div>
                <div className="text-sm text-muted-foreground">Page Load</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-orange-600">A+</div>
                <div className="text-sm text-muted-foreground">Security</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}