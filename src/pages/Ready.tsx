import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ExternalLink, 
  Download, 
  Settings, 
  Palette,
  Globe,
  ArrowLeft,
  Share2,
  UserPlus,
  LayoutDashboard,
  RefreshCw
} from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function Ready() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  const {
    business_name,
    preview_url,
    admin_url,
    colors,
    fonts,
    pages_meta,
    seo_title,
    reset: resetStore
  } = useOnboardingStore();

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyUrl = async () => {
    if (preview_url) {
      await navigator.clipboard.writeText(preview_url);
      setCopied(true);
    }
  };

  const handleStartOver = () => {
    resetStore();
    navigate({ to: '/brief' });
  };

  const handleSignUp = () => {
    navigate({ to: '/auth' });
  };

  const handleDashboard = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🎉 Congratulations!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your website for {business_name} is ready and live!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Website Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Your Live Website
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Website Preview
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Website URL</span>
                    <div className="flex gap-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded border">
                        {preview_url || 'https://your-site.example.com'}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyUrl}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => preview_url && window.open(preview_url, '_blank')}
                      disabled={!preview_url}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview Website
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => admin_url && window.open(admin_url, '_blank')}
                      disabled={!admin_url}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Website Details */}
            <Card>
              <CardHeader>
                <CardTitle>Website Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">SEO Optimization</h3>
                  <p className="text-sm text-muted-foreground mb-2">{seo_title}</p>
                  <Badge variant="secondary">SEO Ready</Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Design System</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: colors.primary_color }}
                    />
                    <span className="text-sm">Primary: {colors.primary_color}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4" />
                    <span className="text-sm">Font: {fonts.heading || fonts.body || 'Inter'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Pages Created</h3>
                  <div className="grid grid-cols-2 gap-1">
                    {pages_meta.map((page, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {page.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Customize Content</h3>
                  <p className="text-sm text-muted-foreground">Edit your pages and add your own content</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Connect Domain</h3>
                  <p className="text-sm text-muted-foreground">Connect your custom domain name</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Backup & Export</h3>
                  <p className="text-sm text-muted-foreground">Download backups of your site</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!user ? (
              <Button 
                onClick={handleSignUp}
                size="lg"
                className="w-full max-w-sm"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Sign Up to Save & Manage
              </Button>
            ) : (
              <Button 
                onClick={handleDashboard}
                size="lg"
                className="w-full max-w-sm"
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>
            )}
            
            <Button 
              onClick={handleStartOver}
              variant="outline" 
              size="lg"
              className="w-full max-w-sm"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Create Another Site
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}