import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlanStore } from '@/lib/stores/usePlanStore';
import { useSubscription } from '@/hooks/useSubscription';

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
  const { currentPlan, setPlan } = usePlanStore();
  const { createCheckout } = useSubscription();

  const handleBack = () => {
    navigate({ to: '/dashboard' });
  };

  const handlePlanSelect = async (plan: 'starter' | 'pro' | 'custom') => {
    if (plan === 'custom') {
      window.open('mailto:sales@naveeg.com?subject=Custom Plan Inquiry', '_blank');
    } else {
      // Get the appropriate price ID from Supabase secrets
      const priceId = plan === 'starter' ? 'price_starter_monthly' : 'price_pro_monthly';
      
      // Get current site ID (you may want to pass this from context or params)
      const currentSiteId = null; // TODO: Get actual site ID from context
      
      try {
        await createCheckout(priceId, currentSiteId);
      } catch (error) {
        console.error('Failed to create checkout:', error);
      }
    }
  };

  const getPlanCTA = (plan: string) => {
    switch (plan) {
      case 'starter':
        return currentPlan === 'starter' ? 'Current Plan' : 'Choose Starter';
      case 'pro':
        return currentPlan === 'pro' ? 'Current Plan' : 'Choose Pro';
      case 'custom':
        return 'Contact Sales';
      default:
        return 'Choose Plan';
    }
  };

  const isPlanDisabled = (plan: string) => {
    return currentPlan === plan;
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
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Starter */}
          <Card className={`relative ${currentPlan === 'starter' ? 'border-primary bg-primary-light' : ''}`}>
            {currentPlan === 'starter' && (
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
                variant={currentPlan === 'starter' ? 'outline' : 'default'}
              >
                {getPlanCTA('starter')}
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className={`relative ${currentPlan === 'pro' ? 'border-primary bg-primary-light' : 'border-primary/50 scale-105'}`}>
            {currentPlan === 'pro' ? (
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
                variant={currentPlan === 'pro' ? 'outline' : 'default'}
              >
                {getPlanCTA('pro')}
              </Button>
            </CardContent>
          </Card>

          {/* Custom */}
          <Card className={`relative ${currentPlan === 'custom' ? 'border-primary bg-primary-light' : ''}`}>
            {currentPlan === 'custom' && (
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