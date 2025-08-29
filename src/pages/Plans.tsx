import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const planFeatures = [
  { name: 'Pages', starter: '5 max', pro: 'Unlimited', custom: 'Unlimited + multi-site' },
  { name: 'AI Content & Translations', starter: false, pro: true, custom: true },
  { name: 'Design Studio', starter: 'Basic', pro: 'Advanced', custom: 'Full theming + multi-site' },
  { name: 'SEO', starter: 'Basic', pro: 'Full suite', custom: 'Enterprise automation' },
  { name: 'Analytics', starter: 'Visitors', pro: 'GA4/GSC', custom: 'Enterprise dashboards + API' },
  { name: 'Domain & SSL', starter: '1 domain (after trial)', pro: 'Multi-domains + redirects', custom: 'Enterprise DNS + SSL automation' },
  { name: 'Backups', starter: 'Daily auto', pro: 'Self-restore + staging', custom: 'Long-term retention' },
  { name: 'Security', starter: 'Core updates', pro: 'Firewall + 2FA', custom: 'Enterprise policies, IP whitelist' },
  { name: 'Store', starter: false, pro: 'WooCommerce', custom: 'Multi-store + ERP' },
  { name: 'Leads & Forms', starter: 'Contact form', pro: 'Builder + CRM export', custom: 'CRM integrations' },
  { name: 'Automations', starter: 'Demo only', pro: 'Basic recipes', custom: 'Advanced workflows' },
  { name: 'Integrations', starter: 'GA basic', pro: 'GA4, GSC, Stripe, Mailchimp, WhatsApp', custom: 'All + custom API' },
  { name: 'Settings', starter: 'Basic profile', pro: 'Multi-language, team roles', custom: 'Advanced roles + API tokens' },
  { name: 'Support', starter: 'FAQ/docs', pro: 'Chat + guided tours', custom: 'Dedicated manager' },
];

export default function Plans() {
  const navigate = useNavigate();
  const { subscription, createCheckout, loading, fetchSubscription } = useSubscription();
  const { toast } = useToast();
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [loadingSite, setLoadingSite] = useState(true);

  // Site context - resolve non-null currentSiteId and fetch subscription
  useEffect(() => {
    const resolveSiteId = async () => {
      try {
        console.log('[PLANS] Resolving site ID...');
        
        // 1. Check router params first
        const urlParams = new URLSearchParams(window.location.search);
        let siteId = urlParams.get('site_id');
        
        // 2. Check localStorage cache
        if (!siteId) {
          siteId = localStorage.getItem('currentSiteId');
        }
        
        // 3. Fetch user's first site from DB if none found
        if (!siteId) {
          console.log('[PLANS] No cached site ID, fetching from database...');
          const { data: sites, error } = await supabase
            .from('sites')
            .select('id')
            .limit(1)
            .single();
          
          if (error) {
            console.error('[PLANS] Error fetching sites:', error);
            throw error;
          }
          
          if (sites?.id) {
            siteId = sites.id;
            localStorage.setItem('currentSiteId', siteId);
            console.log('[PLANS] Cached new site ID:', siteId);
          }
        }
        
        if (!siteId) {
          throw new Error('No site found for this user');
        }
        
        setCurrentSiteId(siteId);
        console.log('[PLANS] Current site ID resolved to:', siteId);
        
        // Fetch subscription for this specific site
        fetchSubscription(siteId);
      } catch (error) {
        console.error('[PLANS] Error resolving site ID:', error);
        toast({
          title: "Error",
          description: "Could not load site information. Please create a site first.",
          variant: "destructive"
        });
      } finally {
        setLoadingSite(false);
      }
    };

    resolveSiteId();
  }, [toast, fetchSubscription]);

  const handleBack = () => {
    navigate({ to: '/dashboard' });
  };

  const handlePlanSelect = async (plan: 'starter' | 'pro' | 'custom') => {
    console.log('[PLANS] Plan selected:', plan, 'Current site ID:', currentSiteId, 'Loading site:', loadingSite);
    
    if (plan === 'custom') {
      window.open('mailto:sales@naveeg.com?subject=Custom Plan Inquiry', '_blank');
      return;
    }

    if (loadingSite) {
      toast({
        title: "Loading",
        description: "Please wait while we load your site information.",
        variant: "destructive"
      });
      return;
    }

    if (!currentSiteId) {
      toast({
        title: "Error",
        description: "No site found. Please create a site first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('[PLANS] Starting checkout for:', { plan, site_id: currentSiteId });
      await createCheckout(plan, currentSiteId);
    } catch (error) {
      console.error('[PLANS] Failed to create checkout:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCurrentPlanId = () => {
    if (!subscription || !subscription.plan_id) return null;
    return subscription.plan_id; // Now using actual plan_id from database
  };

  const getPlanCTA = (plan: string) => {
    if (loading || loadingSite) return 'Loading...';
    const currentPlanId = getCurrentPlanId();
    const isActive = subscription && ['active', 'past_due'].includes(subscription.status);
    const isTrialing = subscription && subscription.status === 'trialing';
    
    switch (plan) {
      case 'starter':
        if (currentPlanId === 'starter' && isActive) return 'Current Plan';
        if (isTrialing) return 'Upgrade from Trial';
        return 'Choose Starter';
      case 'pro':
        if (currentPlanId === 'pro' && isActive) return 'Current Plan';
        if (isTrialing) return 'Upgrade from Trial';
        return 'Choose Pro';
      case 'custom':
        return 'Contact Sales';
      default:
        return 'Choose Plan';
    }
  };

  const isPlanDisabled = (plan: string) => {
    if (loading || loadingSite) return true;
    const currentPlanId = getCurrentPlanId();
    const isActive = subscription && ['active', 'past_due'].includes(subscription.status);
    return currentPlanId === plan && isActive;
  };

  const renderFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-600 mx-auto" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="font-sansation text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your business needs. Upgrade or downgrade anytime.
          </p>
          {subscription?.status === 'trialing' && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-primary font-medium">
                🎉 You're currently on a 7-day free trial! Upgrade to continue using your website after the trial ends.
              </p>
            </div>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Starter */}
          <Card className={`relative ${getCurrentPlanId() === 'starter' ? 'border-primary bg-primary-light' : ''}`}>
            {getCurrentPlanId() === 'starter' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Current Plan
                </Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Starter</CardTitle>
              <div className="text-3xl font-bold">€49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground">Perfect for small businesses getting started</p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handlePlanSelect('starter')}
                className="w-full mb-6"
                disabled={isPlanDisabled('starter')}
                variant={getCurrentPlanId() === 'starter' ? 'outline' : 'default'}
              >
                {getPlanCTA('starter')}
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className={`relative ${getCurrentPlanId() === 'pro' ? 'border-primary bg-primary-light' : 'border-primary/50 scale-105'}`}>
            {getCurrentPlanId() === 'pro' ? (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Current Plan
                </Badge>
              </div>
            ) : (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Pro</CardTitle>
              <div className="text-3xl font-bold">€99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground">For growing businesses needing more</p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handlePlanSelect('pro')}
                className="w-full mb-6"
                disabled={isPlanDisabled('pro')}
                variant={getCurrentPlanId() === 'pro' ? 'outline' : 'default'}
              >
                {getPlanCTA('pro')}
              </Button>
            </CardContent>
          </Card>

          {/* Custom */}
          <Card className={`relative ${getCurrentPlanId() === 'custom' ? 'border-primary bg-primary-light' : ''}`}>
            {getCurrentPlanId() === 'custom' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Current Plan
                </Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Custom</CardTitle>
              <div className="text-3xl font-bold">Contact us</div>
              <p className="text-muted-foreground">Advanced solutions for agencies or enterprises</p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handlePlanSelect('custom')}
                className="w-full mb-6"
                variant="outline"
              >
                {getPlanCTA('custom')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Feature Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 bg-muted/50 text-sm font-medium">
                  <div className="p-4 border-r">Feature</div>
                  <div className="p-4 border-r text-center">Starter</div>
                  <div className="p-4 border-r text-center">Pro</div>
                  <div className="p-4 text-center">Custom</div>
                </div>
                
                {/* Feature Rows */}
                {planFeatures.map((feature, index) => (
                  <div key={index} className="grid grid-cols-4 border-t text-sm">
                    <div className="p-4 border-r font-medium">{feature.name}</div>
                    <div className="p-4 border-r text-center">
                      {renderFeatureValue(feature.starter)}
                    </div>
                    <div className="p-4 border-r text-center">
                      {renderFeatureValue(feature.pro)}
                    </div>
                    <div className="p-4 text-center">
                      {renderFeatureValue(feature.custom)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile View - Accordions would go here for smaller screens */}
            <div className="block md:hidden mt-8">
              <p className="text-sm text-muted-foreground text-center">
                For detailed feature comparison, please view on desktop or contact our team.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Need help choosing the right plan?
          </p>
          <Button variant="outline" onClick={() => window.open('mailto:support@naveeg.com', '_blank')}>
            Contact our team
          </Button>
        </div>
      </div>
    </div>
  );
}