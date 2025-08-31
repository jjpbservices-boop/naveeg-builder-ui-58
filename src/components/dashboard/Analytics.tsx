import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, helpers, type PSIResponse, type VisitorsResponse } from '@/lib/api';
import { PeriodSelector } from '@/components/analytics/PeriodSelector';

interface Website {
  id: number;
  tenweb_website_id: number;
  site_url: string;
  name: string;
}

interface AnalyticsProps {
  website?: Website;
}

export function Analytics({ website }: AnalyticsProps) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visitorsData, setVisitorsData] = useState<VisitorsResponse | null>(null);
  const [psiData, setPsiData] = useState<{
    mobile: PSIResponse | null;
    desktop: PSIResponse | null;
  }>({ mobile: null, desktop: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (website?.tenweb_website_id) {
      loadAnalyticsData();
    }
  }, [website?.tenweb_website_id, period]);

  const loadAnalyticsData = async () => {
    if (!website?.tenweb_website_id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load visitors and PSI data in parallel
      const [visitorsResult, psiResult] = await Promise.allSettled([
        api.getVisitors(website.tenweb_website_id, period),
        api.runPSIBoth(website.site_url)
      ]);

      // Process visitors data
      if (visitorsResult.status === 'fulfilled') {
        setVisitorsData(visitorsResult.value);
      } else {
        console.error('Visitors data failed:', visitorsResult.reason);
      }

      // Process PSI data
      if (psiResult.status === 'fulfilled') {
        setPsiData(psiResult.value);
      } else {
        console.error('PSI data failed:', psiResult.reason);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshPSI = async () => {
    if (!website?.site_url) return;
    
    try {
      setRefreshing(true);
      const result = await api.runPSIBoth(website.site_url);
      setPsiData(result);
      toast({
        title: "PageSpeed data refreshed",
        description: "Performance metrics have been updated."
      });
    } catch (error) {
      console.error('Failed to refresh PSI:', error);
      toast({
        title: "Refresh failed",
        description: "Could not update performance data.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getPerformanceScore = (psi: PSIResponse | null) => {
    if (!psi?.lighthouseResult?.categories?.performance) return null;
    return helpers.getPSIScore(psi.lighthouseResult.categories.performance.score);
  };

  const getCoreWebVitals = (psi: PSIResponse | null) => {
    const loadingExp = psi?.loadingExperience || psi?.originLoadingExperience;
    if (!loadingExp?.metrics) return null;

    return {
      lcp: loadingExp.metrics.LARGEST_CONTENTFUL_PAINT,
      inp: loadingExp.metrics.INTERACTION_TO_NEXT_PAINT,
      cls: loadingExp.metrics.CUMULATIVE_LAYOUT_SHIFT
    };
  };

  const getTopOpportunities = (psi: PSIResponse | null) => {
    if (!psi?.lighthouseResult?.audits) return [];
    
    const audits = psi.lighthouseResult.audits;
    const opportunities = Object.entries(audits)
      .filter(([_, audit]) => audit.details?.overallSavingsMs && audit.details.overallSavingsMs > 300)
      .sort(([_, a], [__, b]) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
      .slice(0, 3);
    
    return opportunities.map(([key, audit]) => ({
      id: key,
      title: audit.title || key.replace(/-/g, ' '),
      savings: audit.details?.overallSavingsMs || 0
    }));
  };

  if (!website) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No Website Selected</CardTitle>
            <CardDescription>
              Please select a website from the sidebar to view analytics.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const mobilePerf = getPerformanceScore(psiData.mobile);
  const desktopPerf = getPerformanceScore(psiData.desktop);
  const cwvMobile = getCoreWebVitals(psiData.mobile);
  const cwvDesktop = getCoreWebVitals(psiData.desktop);
  const opportunities = getTopOpportunities(psiData.mobile);

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Performance insights and visitor data</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPSI}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh PSI
          </Button>
          <PeriodSelector period={period} onPeriodChange={setPeriod} />
        </div>
      </div>

      {/* Performance Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mobile Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !mobilePerf ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{mobilePerf.score}</div>
                <Badge variant={
                  mobilePerf.rating === 'good' ? 'default' :
                  mobilePerf.rating === 'needs-improvement' ? 'secondary' : 'destructive'
                }>
                  {mobilePerf.rating === 'good' ? 'Good' :
                   mobilePerf.rating === 'needs-improvement' ? 'Needs Improvement' : 'Poor'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desktop Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !desktopPerf ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{desktopPerf.score}</div>
                <Badge variant={
                  desktopPerf.rating === 'good' ? 'default' :
                  desktopPerf.rating === 'needs-improvement' ? 'secondary' : 'destructive'
                }>
                  {desktopPerf.rating === 'good' ? 'Good' :
                   desktopPerf.rating === 'needs-improvement' ? 'Needs Improvement' : 'Poor'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Core Web Vitals (Real User Data)
          </CardTitle>
          <CardDescription>
            75th percentile values from real users over the last 28 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-sm font-medium mb-1">Largest Contentful Paint</div>
                <div className="text-2xl font-bold">
                  {cwvMobile?.lcp ? helpers.formatCWV('LARGEST_CONTENTFUL_PAINT', cwvMobile.lcp.percentile) : 'N/A'}
                </div>
                {cwvMobile?.lcp && (
                  <Badge variant={cwvMobile.lcp.category === 'FAST' ? 'default' : 'destructive'} className="text-xs">
                    {cwvMobile.lcp.category}
                  </Badge>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium mb-1">Interaction to Next Paint</div>
                <div className="text-2xl font-bold">
                  {cwvMobile?.inp ? helpers.formatCWV('INTERACTION_TO_NEXT_PAINT', cwvMobile.inp.percentile) : 'N/A'}
                </div>
                {cwvMobile?.inp && (
                  <Badge variant={cwvMobile.inp.category === 'FAST' ? 'default' : 'destructive'} className="text-xs">
                    {cwvMobile.inp.category}
                  </Badge>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium mb-1">Cumulative Layout Shift</div>
                <div className="text-2xl font-bold">
                  {cwvMobile?.cls ? helpers.formatCWV('CUMULATIVE_LAYOUT_SHIFT', cwvMobile.cls.percentile) : 'N/A'}
                </div>
                {cwvMobile?.cls && (
                  <Badge variant={cwvMobile.cls.category === 'FAST' ? 'default' : 'destructive'} className="text-xs">
                    {cwvMobile.cls.category}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Opportunities */}
      {opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Optimization Opportunities</CardTitle>
            <CardDescription>
              These improvements could significantly boost your performance score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp, index) => (
                <div key={opp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{opp.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Potential savings: {(opp.savings / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {(opp.savings / 1000).toFixed(1)}s
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visitor Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Traffic</CardTitle>
          <CardDescription>
            Traffic trend for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !visitorsData ? (
            <Skeleton className="h-64 w-full" />
          ) : visitorsData.data && visitorsData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorsData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [value, 'Visitors']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No visitor data available for this period</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}