import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Palette, 
  BarChart3, 
  Globe,
  User,
  LogOut,
  Settings2,
  Shield,
  Database,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardSkeleton, LoadingSpinner } from '@/components/LoadingStates';
import { useSecureApi, useAuthCheck } from '@/hooks/useSecureApi';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics';
import { DashboardDesign } from '@/components/dashboard/DashboardDesign';
import { DashboardDomain } from '@/components/dashboard/DashboardDomain';


export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requireAuth } = useAuthCheck();
  const [user, setUser] = useState<any>(null);
  const [websites, setWebsites] = useState<any[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'design' | 'analytics' | 'domain' | 'backup' | 'security'>('overview');

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: '/auth' });
        return;
      }
      setUser(session.user);
      loadUserWebsites(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate({ to: '/auth' });
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserWebsites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWebsites(data || []);
      if (data && data.length > 0) {
        setCurrentWebsite(data[0]);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your websites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'URL copied to clipboard',
    });
  };

  const handleNavigate = (to: string) => {
    navigate({ to });
  };

  const reloadWebsites = () => {
    if (user?.id) {
      loadUserWebsites(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Loading your websites...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <DashboardOverview
            currentWebsite={currentWebsite}
            copied={copied}
            onCopyUrl={handleCopyUrl}
            onNavigate={handleNavigate}
          />
        );
      case 'analytics':
        return (
          <DashboardAnalytics
            currentWebsite={currentWebsite}
          />
        );
      case 'design':
        return (
          <DashboardDesign
            currentWebsite={currentWebsite}
            onWebsiteUpdate={reloadWebsites}
          />
        );
      case 'domain':
        return (
          <DashboardDomain
            currentWebsite={currentWebsite}
          />
        );
      case 'backup':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Website Backups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Backup management coming soon</p>
                <p className="text-sm text-muted-foreground">
                  Automated daily backups are already protecting your website.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Your website is secure</p>
                <p className="text-sm text-muted-foreground">
                  SSL certificate active, regular security scans, and performance monitoring.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  {currentWebsite ? `${currentWebsite.business_name} • ${currentWebsite.business_type}` : 'Manage your websites'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Website Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={activeView === 'overview' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveView('overview')}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Overview
                  </Button>
                  <Button
                    variant={activeView === 'analytics' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveView('analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant={activeView === 'design' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveView('design')}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Design Studio
                  </Button>
                  <Button
                    variant={activeView === 'domain' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveView('domain')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Domain & SSL
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Advanced Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={activeView === 'backup' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveView('backup')}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Backups
                  </Button>
                  <Button
                    variant={activeView === 'security' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveView('security')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate({ to: '/workspace' })}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}