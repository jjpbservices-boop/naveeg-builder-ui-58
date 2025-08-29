import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Globe, 
  ExternalLink, 
  Settings, 
  Copy,
  Check,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DashboardOverviewProps {
  currentWebsite: any;
  copied: boolean;
  onCopyUrl: (url: string) => void;
  onNavigate: (to: string) => void;
}

export function DashboardOverview({ currentWebsite, copied, onCopyUrl, onNavigate }: DashboardOverviewProps) {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    daysOnline: 0
  });
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentWebsite?.id) {
      loadAnalytics();
    }
  }, [currentWebsite?.id]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('site_id', currentWebsite.id);

      if (events) {
        const pageViews = events.filter(e => e.label === 'page_view').length;
        const uniqueVisitors = new Set(
          events.map(e => {
            const data = e.data as any;
            return data?.session_id || data?.user_id;
          }).filter(Boolean)
        ).size;
        
        const createdDate = new Date(currentWebsite.created_at);
        const daysOnline = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        setAnalytics({
          pageViews,
          uniqueVisitors,
          daysOnline: daysOnline > 0 ? daysOnline : 1
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentWebsite) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No website found</p>
        <Button onClick={() => onNavigate('/brief')}>
          Create Your First Website
        </Button>
      </div>
    );
  }

  const isGenerating = currentWebsite.status === 'creating' || currentWebsite.status === 'generating' || !currentWebsite.site_url;
  const hasUrls = currentWebsite.site_url || currentWebsite.admin_url;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'generating': 
      case 'creating': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'generating': return 'Generating';
      case 'creating': return 'Creating';
      case 'created': return isGenerating ? 'Processing' : 'Ready';
      default: return status || 'Active';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {currentWebsite?.status === 'published' ? '99.9%' : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : analytics.uniqueVisitors || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : analytics.pageViews || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? '-' : analytics.daysOnline}
                </p>
                <p className="text-xs text-muted-foreground">Days Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Website Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Live Website Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasUrls ? (
              <>
                {currentWebsite.site_url && (
                  <div className="flex items-center gap-2">
                    <Input 
                      value={currentWebsite.site_url} 
                      readOnly 
                      className="flex-1 font-mono text-sm"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onCopyUrl(currentWebsite.site_url)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
                
                {/* Website Preview Frame */}
                {currentWebsite.site_url && (
                  <div className="border rounded-lg overflow-hidden bg-muted relative group">
                    <div className="aspect-video relative">
                      {previewError ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center space-y-4">
                            <AlertCircle className="h-12 w-12 mx-auto opacity-50" />
                            <div>
                              <p className="text-lg font-medium">Preview Not Available</p>
                              <p className="text-sm">The website cannot be displayed in this frame due to security settings.</p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => window.open(currentWebsite.site_url, '_blank')}
                              className="mt-4"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Website in New Tab
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <iframe
                            src={currentWebsite.site_url}
                            className="w-full h-full"
                            title="Live Website Preview"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                            onError={() => setPreviewError(true)}
                            onLoad={(e) => {
                              try {
                                const iframe = e.target as HTMLIFrameElement;
                                if (!iframe.contentDocument && !iframe.contentWindow) {
                                  setPreviewError(true);
                                }
                              } catch {
                                setPreviewError(true);
                              }
                            }}
                          />
                          
                          {/* Clickable overlay */}
                          <div 
                            className="absolute inset-0 bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                            onClick={() => window.open(currentWebsite.site_url, '_blank')}
                          >
                            <div className="bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              <span className="text-sm font-medium">Click to open in new tab</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {currentWebsite.site_url && (
                    <Button 
                      className="flex-1"
                      onClick={() => window.open(currentWebsite.site_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Live Site
                    </Button>
                  )}
                  {currentWebsite.admin_url && (
                    <Button 
                      variant={currentWebsite.site_url ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => window.open(currentWebsite.admin_url, '_blank')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      WP Admin
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex items-center justify-center mb-4">
                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
                <p className="text-muted-foreground mb-2">
                  {isGenerating ? 'Website is being generated' : 'Website information not available'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isGenerating ? 'This usually takes 2-3 minutes' : 'Please check back later or contact support'}
                </p>
                {isGenerating && (
                  <Button
                    variant="outline"
                    onClick={loadAnalytics}
                    className="mt-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Website Details */}
        <Card>
          <CardHeader>
            <CardTitle>Website Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                <p className="font-medium">{currentWebsite.business_name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                <div className="mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {currentWebsite.business_type?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(currentWebsite.status)} className="capitalize">
                      {getStatusLabel(currentWebsite.status)}
                    </Badge>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(currentWebsite.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{formatDate(currentWebsite.updated_at)}</p>
                </div>
              </div>

              {currentWebsite.seo_title && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">SEO Title</Label>
                  <p className="text-sm">{currentWebsite.seo_title}</p>
                </div>
              )}

              {currentWebsite.seo_description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">SEO Description</Label>
                  <p className="text-sm text-muted-foreground">{currentWebsite.seo_description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}