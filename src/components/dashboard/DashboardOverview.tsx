import React from 'react';
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
  RefreshCw
} from 'lucide-react';

interface DashboardOverviewProps {
  currentWebsite: any;
  copied: boolean;
  onCopyUrl: (url: string) => void;
  onNavigate: (to: string) => void;
}

export function DashboardOverview({ currentWebsite, copied, onCopyUrl, onNavigate }: DashboardOverviewProps) {
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
      case 'generating': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
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
                <p className="text-2xl font-bold">98.5%</p>
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
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-muted-foreground">Total Visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">3,821</p>
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
                <p className="text-2xl font-bold">24</p>
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
              Live Website
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentWebsite.site_url ? (
              <>
                <div className="flex items-center gap-2">
                  <Input 
                    value={currentWebsite.site_url} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onCopyUrl(currentWebsite.site_url)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Website Preview Frame */}
                <div className="border rounded-lg overflow-hidden bg-muted">
                  <div className="aspect-video relative">
                    <iframe
                      src={currentWebsite.site_url}
                      className="w-full h-full"
                      title="Website Preview"
                      sandbox="allow-same-origin allow-scripts"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href={currentWebsite.site_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Site
                    </a>
                  </Button>
                  {currentWebsite.admin_url && (
                    <Button asChild variant="outline" className="flex-1">
                      <a href={currentWebsite.admin_url} target="_blank" rel="noopener noreferrer">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </a>
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex items-center justify-center mb-4">
                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
                <p className="text-muted-foreground mb-2">Website is being generated</p>
                <p className="text-sm text-muted-foreground">This usually takes 2-3 minutes</p>
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
                    {currentWebsite.status || 'Active'}
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