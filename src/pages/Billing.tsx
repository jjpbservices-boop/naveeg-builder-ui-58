import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CreditCard, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function Billing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, loading, createCheckout, createPortal, isTrialActive, getTrialDaysLeft } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate({ to: '/auth' });
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate({ to: '/dashboard' });
  };

  const handleUpgradeToStarter = async () => {
    try {
      // Get current site ID
      const siteId = localStorage.getItem('currentSiteId');
      if (!siteId) {
        // Fallback: fetch from database
        const { data: sites, error } = await supabase
          .from('sites')
          .select('id')
          .limit(1)
          .single();

        if (error || !sites?.id) {
          throw new Error('No site found. Please create a site first.');
        }
        localStorage.setItem('currentSiteId', sites.id);
        await createCheckout('starter', sites.id);
      } else {
        await createCheckout('starter', siteId);
      }
    } catch (error) {
      console.error('[BILLING] Error upgrading to starter:', error);
      toast({
        title: "Upgrade Error",
        description: error instanceof Error ? error.message : "Failed to start upgrade process",
        variant: "destructive"
      });
    }
  };

  const handleUpgradeToPro = async () => {
    try {
      // Get current site ID
      const siteId = localStorage.getItem('currentSiteId');
      if (!siteId) {
        // Fallback: fetch from database
        const { data: sites, error } = await supabase
          .from('sites')
          .select('id')
          .limit(1)
          .single();

        if (error || !sites?.id) {
          throw new Error('No site found. Please create a site first.');
        }
        localStorage.setItem('currentSiteId', sites.id);
        await createCheckout('pro', sites.id);
      } else {
        await createCheckout('pro', siteId);
      }
    } catch (error) {
      console.error('[BILLING] Error upgrading to pro:', error);
      toast({
        title: "Upgrade Error",
        description: error instanceof Error ? error.message : "Failed to start upgrade process",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      console.log('[BILLING] Opening customer portal');
      await createPortal();
    } catch (error) {
      console.error('[BILLING] Error opening portal:', error);
      toast({
        title: "Portal Error",
        description: error instanceof Error ? error.message : "Failed to open subscription portal",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return `€${(price / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="text-center py-12">
          Loading billing information...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium capitalize">{subscription.plan_id} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription.plan_id === 'starter' && formatPrice(4900) + '/month'}
                      {subscription.plan_id === 'pro' && formatPrice(9900) + '/month'}
                      {subscription.plan_id === 'custom' && 'Contact us for pricing'}
                    </p>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>

                {subscription.status === 'trialing' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      🎉 You are on a 7-day free trial. {getTrialDaysLeft()} day{getTrialDaysLeft() !== 1 ? 's' : ''} left until your website is deactivated unless you subscribe.
                    </p>
                  </div>
                )}

                {subscription.current_period_end && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {subscription.status === 'trialing' 
                      ? `Trial ends ${new Date(subscription.trial_end!).toLocaleDateString()}`
                      : `Next billing ${new Date(subscription.current_period_end).toLocaleDateString()}`
                    }
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No active subscription found.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Actions</CardTitle>
            <CardDescription>
              Upgrade your plan or manage your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {(!subscription || subscription.plan_id === 'trial' || subscription.plan_id === 'starter') && (
                <div className="space-y-2">
                  <h4 className="font-medium">Upgrade to Starter</h4>
                  <p className="text-sm text-muted-foreground">Perfect for getting started - {formatPrice(4900)}/month</p>
                  <Button onClick={handleUpgradeToStarter} className="w-full">
                    Upgrade to Starter
                  </Button>
                </div>
              )}

              {(!subscription || subscription.plan_id !== 'pro') && (
                <div className="space-y-2">
                  <h4 className="font-medium">Upgrade to Pro</h4>
                  <p className="text-sm text-muted-foreground">Everything you need to grow - {formatPrice(9900)}/month</p>
                  <Button onClick={handleUpgradeToPro} className="w-full">
                    Upgrade to Pro
                  </Button>
                </div>
              )}

              {subscription?.stripe_customer_id && (
                <div className="space-y-2">
                  <h4 className="font-medium">Manage Subscription</h4>
                  <p className="text-sm text-muted-foreground">Update payment method, view invoices, or cancel</p>
                  <Button onClick={handleManageSubscription} variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your past invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Billing history will appear here once you have an active subscription.</p>
              <p className="text-sm mt-1">You can also access detailed invoices through the billing portal.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}