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
import { Shield, Archive, Store, Mail, Zap, Settings as SettingsIcon } from 'lucide-react';
import { TrialBanner } from '@/components/TrialBanner';
import { TrialExpiredScreen } from '@/components/TrialExpiredScreen';
import { LockedFeature } from '@/components/LockedFeature';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useSubscription } from '@/hooks/useSubscription';
// import { useTrialFallback } from '@/hooks/useTrialFallback';
// import { usePaymentSuccess } from '@/hooks/usePaymentSuccess';


export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [websites, setWebsites] = useState<any[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<string>('overview');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<'starter-to-pro' | 'pro-to-custom'>('starter-to-pro');

  const { 
    subscription,
    fetchSubscription,
    isTrialActive,
    isSubscriptionActive,
    canConnectDomain,
    getTrialDaysLeft
  } = useSubscription();

  // Fetch subscription when currentWebsite changes
  useEffect(() => {
    if (currentWebsite?.id) {
      console.log('[DASHBOARD] Fetching subscription for site:', currentWebsite.id);
      fetchSubscription(currentWebsite.id);
    }
  }, [currentWebsite?.id]); // Removed fetchSubscription from dependencies to prevent infinite loop

  // Create stable callback for trial creation to prevent dependency loop
  const handleTrialCreated = React.useCallback(() => {
    console.log('[DASHBOARD] Trial created, refetching subscription');
    // Refetch subscription instead of page reload
    if (currentWebsite?.id) {
      fetchSubscription(currentWebsite.id);
    }
  }, [currentWebsite?.id]); // Removed fetchSubscription dependency to prevent infinite loop

  // Removed useTrialFallback and usePaymentSuccess to prevent infinite refresh loops

  useEffect(() => {
    // Get initial session only - auth state is managed by AuthProvider
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Dashboard initial session check:', session?.user?.id);
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

  const handleViewChange = (view: string) => {
    // Handle special navigation cases
    if (view === 'plans') {
      navigate({ to: '/plans' });
      return;
    }

    const featureMap = {
      analytics: 'analytics_advanced',
      store: 'store',
      automations: 'automations',
      forms: 'forms_advanced',
      security: 'security_advanced',
    };

    const requiredFeature = featureMap[view as keyof typeof featureMap];
    
    if (requiredFeature && !isSubscriptionActive()) {
      const requiredPlan = getRequiredPlan(requiredFeature);
      setUpgradeType(requiredPlan === 'custom' ? 'pro-to-custom' : 'starter-to-pro');
      setUpgradeModalOpen(true);
      return;
    }

    setActiveView(view);
  };

  const getRequiredPlan = (feature: string) => {
    const customFeatures = ['multisite'];
    return customFeatures.includes(feature) ? 'custom' : 'pro';
  };

  const handleUpgrade = () => {
    setUpgradeModalOpen(false);
    if (upgradeType === 'pro-to-custom') {
      window.open('mailto:sales@naveeg.com?subject=Custom Plan Inquiry', '_blank');
    } else {
      navigate({ to: '/plans' });
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
              <header className="flex h-16 shrink-0 items-center gap-4 px-6">
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
    // Check feature access for specific views
    const featureRequirements = {
      analytics: 'analytics_advanced',
      store: 'store', 
      automations: 'automations',
      forms: 'forms_advanced',
      security: 'security_advanced',
    };

    const requiredFeature = featureRequirements[activeView as keyof typeof featureRequirements];
    
    if (requiredFeature && !isSubscriptionActive()) {
      const requiredPlan = getRequiredPlan(requiredFeature);
      const planName = requiredPlan === 'custom' ? 'Custom' : 'Pro';
      
      return (
        <LockedFeature
          featureName={getFeatureName(activeView)}
          description={getFeatureDescription(activeView)}
          requiredPlan={requiredPlan}
          onUpgrade={() => {
            setUpgradeType(requiredPlan === 'custom' ? 'pro-to-custom' : 'starter-to-pro');
            setUpgradeModalOpen(true);
          }}
        />
      );
    }

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
      case 'store':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Online Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">WooCommerce store management</p>
                <p className="text-sm text-muted-foreground">
                  Manage your products, orders, and store settings.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'forms':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Forms & Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Advanced form builder and lead management</p>
                <p className="text-sm text-muted-foreground">
                  Create custom forms, manage leads, and export to CRM.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'automations':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Marketing Automations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Automated marketing workflows</p>
                <p className="text-sm text-muted-foreground">
                  Set up email sequences, triggers, and automated responses.
                </p>
              </div>
            </CardContent>
          </Card>
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
                <p className="text-muted-foreground mb-4">
                  {subscription?.plan_id === 'pro' 
                    ? 'Self-restore backups and staging environment' 
                    : 'Daily automated backups'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription?.plan_id === 'pro'
                    ? 'Restore previous versions and manage staging sites.'
                    : 'Automated daily backups are protecting your website. Contact support for restores.'
                  }
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
                <p className="text-muted-foreground mb-4">
                  {subscription?.plan_id === 'pro' 
                    ? 'Advanced security with firewall and 2FA' 
                    : 'Basic security protection active'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription?.plan_id === 'pro'
                    ? 'SSL certificate, firewall protection, malware scanning, and two-factor authentication.'
                    : 'SSL certificate active and core security updates applied.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'plans':
        // Already handled by sidebar navigation to /dashboard/plans
        return null;
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Account and site settings</p>
                <p className="text-sm text-muted-foreground">
                  Manage your profile, notifications, and preferences.
                </p>
              </div>
            </CardContent>
          </Card>
        );
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
        
        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          upgradeType={upgradeType}
          onUpgrade={handleUpgrade}
        />
      </SidebarProvider>
    </ErrorBoundary>
  );
}