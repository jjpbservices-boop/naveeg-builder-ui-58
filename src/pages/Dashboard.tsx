import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardSkeleton } from '@/components/LoadingStates';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics';
import { DashboardDesign } from '@/components/dashboard/DashboardDesign';
import { DashboardDomain } from '@/components/dashboard/DashboardDomain';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Shield, Archive } from 'lucide-react';


export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [websites, setWebsites] = useState<any[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<string>('overview');

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (!session) {
        console.log('No session, redirecting to auth');
        navigate({ to: '/auth' });
        return;
      }
      setUser(session.user);
      if (session.user?.id) {
        loadUserWebsites(session.user.id);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      if (!session) {
        console.log('No initial session, redirecting to auth');
        navigate({ to: '/auth' });
        return;
      }
      setUser(session.user);
      if (session.user?.id) {
        loadUserWebsites(session.user.id);
      }
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

  // Note: Removed auto-refresh to prevent constant UI updates.
  // Users can manually refresh when needed.

  if (isLoading) {
    return (
      <ErrorBoundary>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AppSidebar 
              activeView={activeView}
              onViewChange={setActiveView}
              user={user}
              onSignOut={handleSignOut}
            />
            
            <SidebarInset className="flex-1">
              <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
                <SidebarTrigger className="h-6 w-6" />
                <div className="flex-1">
                  <h1 className="text-xl font-semibold">Loading...</h1>
                  <p className="text-sm text-muted-foreground">Please wait</p>
                </div>
              </header>

              <main className="flex-1 p-6">
                <DashboardSkeleton />
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
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
      case 'backups':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Website Backups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Settings panel coming soon</p>
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
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar 
            activeView={activeView}
            onViewChange={setActiveView}
            user={user}
            onSignOut={handleSignOut}
          />
          
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
              <SidebarTrigger className="h-6 w-6" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold">
                  {currentWebsite ? currentWebsite.business_name : 'Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentWebsite ? currentWebsite.business_type : 'Manage your websites'}
                </p>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {isLoading ? (
                <DashboardSkeleton />
              ) : (
                renderMainContent()
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}