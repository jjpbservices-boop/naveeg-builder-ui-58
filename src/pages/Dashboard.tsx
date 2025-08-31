import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSupabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardSkeleton } from '@/components/LoadingStates';
import { Overview } from '@/components/dashboard/Overview';
import { Analytics } from '@/components/dashboard/Analytics';
import { DesignStudio } from '@/components/dashboard/DesignStudio';
import { Media } from '@/components/dashboard/Media';
import { Support } from '@/components/dashboard/Support';
import { Advanced } from '@/components/dashboard/Advanced';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

import { TrialBanner } from '@/components/TrialBanner';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaymentSuccess } from '@/hooks/usePaymentSuccess';


export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [websites, setWebsites] = useState<any[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<string>('overview');

  const { fetchSubscription } = useSubscription();

  // Fetch subscription when currentWebsite changes
  useEffect(() => {
    if (currentWebsite?.id) {
      console.log('[DASHBOARD] Fetching subscription for site:', currentWebsite.id);
      fetchSubscription(currentWebsite.id);
    }
  }, [currentWebsite?.id]); // Removed fetchSubscription from dependencies to prevent infinite loop

  // Use payment success hook for subscription refresh after successful payments
  usePaymentSuccess(currentWebsite?.id);

  // Removed useTrialFallback completely - trial creation is now handled exclusively by 10Web webhook
  // This eliminates the infinite refresh loop caused by competing trial creation mechanisms

  // Load websites when user is available from AuthProvider
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[DASHBOARD] No user found, redirecting to auth');
      navigate({ to: '/auth' });
      return;
    }
    
    if (user?.id) {
      console.log('[DASHBOARD] Loading websites for user:', user.id);
      loadUserWebsites(user.id);
    }
  }, [user, authLoading, navigate]);

  const loadUserWebsites = async (userId: string) => {
    try {
      console.log('[DASHBOARD] Loading websites for user ID:', userId);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('sites')
        .select('id, title, subdomain, site_url, plan, website_id, tenweb_website_id, business_name, business_type, created_at, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('[DASHBOARD] Database query result:', { data, error, userId });

      if (error) throw error;

      console.log('[DASHBOARD] Found websites:', data?.length || 0);
      setWebsites(data || []);
      if (data && data.length > 0) {
        console.log('[DASHBOARD] Setting current website:', data[0]);
        setCurrentWebsite(data[0]);
      } else {
        console.log('[DASHBOARD] No websites found for user');
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
    const supabase = getSupabase();
    await supabase.auth.signOut();
    // AuthProvider will handle the state change and redirect
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

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };


  // Show loading while auth is resolving or while loading websites
  if (authLoading || isLoading) {
    return (
      <ErrorBoundary>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AppSidebar 
              activeView={activeView}
              onViewChange={handleViewChange}
              user={user}
              onSignOut={handleSignOut}
            />
            
            <SidebarInset className="flex-1">
              <header className="flex h-16 shrink-0 items-center gap-4 px-6">
                <SidebarTrigger className="h-6 w-6" />
                <div className="flex-1">
                  <h1 className="text-xl font-semibold">
                    {authLoading ? 'Authenticating...' : 'Loading...'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {authLoading ? 'Verifying your session' : 'Loading your websites'}
                  </p>
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
          <Overview
            website={currentWebsite ? {
              id: currentWebsite.tenweb_website_id || currentWebsite.website_id,
              tenweb_website_id: currentWebsite.tenweb_website_id || currentWebsite.website_id,
              site_url: currentWebsite.site_url || `https://${currentWebsite.subdomain}.naveeg.app`,
              admin_url: currentWebsite.admin_url || `https://${currentWebsite.subdomain}.naveeg.app/wp-admin`,
              name: currentWebsite.business_name || currentWebsite.title || 'My Website'
            } : undefined}
          />
        );
      case 'analytics':
        return (
          <ErrorBoundary>
            <Analytics website={currentWebsite} />
          </ErrorBoundary>
        );
      case 'designstudio':
        return <DesignStudio currentWebsite={currentWebsite} />;
      case 'media':
        return <Media currentWebsite={currentWebsite} />;
      case 'support':
        return <Support currentWebsite={currentWebsite} />;
      case 'advanced':
        return <Advanced currentWebsite={currentWebsite} />;
      default:
        return null;
    }
  };

  const getFeatureName = (view: string) => {
    const names = {
      analytics: 'Advanced Analytics',
      store: 'Online Store',
      automations: 'Marketing Automations',
      forms: 'Advanced Forms',
      security: 'Advanced Security',
    };
    return names[view as keyof typeof names] || view;
  };

  const getFeatureDescription = (view: string) => {
    const descriptions = {
      analytics: 'Get detailed insights with GA4 integration, conversion tracking, and advanced reporting.',
      store: 'Create and manage your WooCommerce store with product catalogs and order management.',
      automations: 'Set up automated email sequences, triggers, and marketing workflows.',
      forms: 'Build custom forms, manage leads, and export data to your CRM.',
      security: 'Protect your site with firewall, malware scanning, and two-factor authentication.',
    };
    return descriptions[view as keyof typeof descriptions] || 'Access advanced features for your website.';
  };


  // Remove trial expired check - handled by TrialBanner now

  return (
    <ErrorBoundary>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar 
            activeView={activeView}
            onViewChange={handleViewChange}
            user={user}
            onSignOut={handleSignOut}
          />
          
          <SidebarInset className="flex-1">
            {/* Trial Banner */}
            <TrialBanner />
            
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-4 px-6">
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