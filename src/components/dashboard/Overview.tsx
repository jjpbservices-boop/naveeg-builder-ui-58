import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, Shield, Upload, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, helpers } from '@/lib/api';

interface Website {
  id: number;
  tenweb_website_id: number;
  site_url: string;
  admin_url: string;
  name: string;
}

interface OverviewProps {
  website?: Website;
}

export function Overview({ website }: OverviewProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<{
    visitorsToday?: number;
    visitorsWeek?: number;
    visitorsMonth?: number;
    performanceScore?: number;
    seoScore?: number;
  }>({});
  const [businessInfo, setBusinessInfo] = useState({
    phone: '',
    email: '',
    address: '',
    hours: ''
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!website?.tenweb_website_id) return;
    
    loadQuickStats();
  }, [website?.tenweb_website_id]);

  const loadQuickStats = async () => {
    if (!website?.tenweb_website_id) return;
    
    try {
      setLoading(true);
      
      // Load visitors and PSI data in parallel
      const [visitorsData, psiData] = await Promise.allSettled([
        Promise.all([
          api.getVisitors(website.tenweb_website_id, 'day'),
          api.getVisitors(website.tenweb_website_id, 'week'),
          api.getVisitors(website.tenweb_website_id, 'month')
        ]),
        api.runPSI({ url: website.site_url, strategy: 'mobile' })
      ]);

      // Process visitors data
      if (visitorsData.status === 'fulfilled') {
        const [day, week, month] = visitorsData.value;
        setQuickStats(prev => ({
          ...prev,
          visitorsToday: day.sum || 0,
          visitorsWeek: week.sum || 0,
          visitorsMonth: month.sum || 0
        }));
      }

      // Process PSI data
      if (psiData.status === 'fulfilled' && psiData.value.lighthouseResult) {
        const categories = psiData.value.lighthouseResult.categories;
        setQuickStats(prev => ({
          ...prev,
          performanceScore: helpers.getPSIScore(categories.performance?.score).score,
          seoScore: helpers.getPSIScore(categories.seo?.score).score
        }));
      }
    } catch (error) {
      console.error('Failed to load quick stats:', error);
      toast({
        title: "Error loading stats",
        description: "Some data may not be available right now.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWPAdminAccess = async () => {
    if (!website?.tenweb_website_id || !website.admin_url) return;
    
    try {
      const response = await api.getAutologin(website.tenweb_website_id, website.admin_url);
      
      if (response.token && response.admin_url) {
        // Construct autologin URL
        const autologinUrl = `${website.site_url}/wp-admin/?twb_wp_login_token=${response.token}&email=user@example.com`;
        window.open(autologinUrl, '_blank');
      } else {
        // Fallback to regular admin URL
        window.open(website.admin_url, '_blank');
      }
    } catch (error) {
      console.error('Autologin failed:', error);
      // Fallback to regular admin URL
      window.open(website.admin_url, '_blank');
    }
  };

  const saveBusinessInfo = () => {
    // TODO: Save business info to Supabase
    setEditing(false);
    toast({
      title: "Business info saved",
      description: "Your business information has been updated."
    });
  };

  if (!website) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No Website Selected</CardTitle>
            <CardDescription>
              Please select a website from the sidebar to view its overview.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Website Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {website.name}
          </CardTitle>
          <CardDescription>
            {website.site_url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.open(website.site_url, '_blank')}
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Site
            </Button>
            <Button 
              onClick={handleWPAdminAccess}
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              WP Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{quickStats.visitorsToday || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{quickStats.visitorsWeek || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{quickStats.visitorsMonth || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{quickStats.performanceScore || 0}</div>
                <Badge variant={
                  (quickStats.performanceScore || 0) >= 90 ? 'default' :
                  (quickStats.performanceScore || 0) >= 50 ? 'secondary' : 'destructive'
                }>
                  {(quickStats.performanceScore || 0) >= 90 ? 'Good' :
                   (quickStats.performanceScore || 0) >= 50 ? 'Needs Work' : 'Poor'}
                </Badge>
              </div>
            )}
            <p className="text-xs text-muted-foreground">speed score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SEO</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{quickStats.seoScore || 0}</div>
                <Badge variant={
                  (quickStats.seoScore || 0) >= 90 ? 'default' :
                  (quickStats.seoScore || 0) >= 50 ? 'secondary' : 'destructive'
                }>
                  {(quickStats.seoScore || 0) >= 90 ? 'Good' :
                   (quickStats.seoScore || 0) >= 50 ? 'Needs Work' : 'Poor'}
                </Badge>
              </div>
            )}
            <p className="text-xs text-muted-foreground">SEO score</p>
          </CardContent>
        </Card>
      </div>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Branding
          </CardTitle>
          <CardDescription>
            Upload your logo and key images for consistent branding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload logo</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured">Featured Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Manage your business contact details and hours.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editing ? saveBusinessInfo() : setEditing(true)}
            >
              {editing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@business.com"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="123 Business St, City, State 12345"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                disabled={!editing}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Business Hours</Label>
              <Textarea
                id="hours"
                placeholder="Mon-Fri: 9AM-5PM"
                value={businessInfo.hours}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, hours: e.target.value }))}
                disabled={!editing}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}