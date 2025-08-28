import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Starter',
    price: '€49',
    period: '/month',
    description: 'Perfect for small businesses getting started',
    features: [
      'AI-generated website creation',
      'Up to 5 pages',
      '1 free domain (first year)',
      'Daily backups & 1-click restore',
      'GDPR-compliant EU hosting',
      'Email/chat support (business hours)',
    ],
    cta: 'Choose Starter',
    variant: 'default' as const,
  },
  {
    name: 'Pro',
    price: '€99',
    period: '/month',
    description: 'For growing businesses needing more',
    popular: true,
    features: [
      'Everything in Starter',
      'Unlimited pages + blog',
      'AI Copilot for content edits',
      'Built-in SEO and Analytics tools',
      'Marketing Automations',
      'Priority support (chat + extended hours)',
    ],
    cta: 'Choose Pro',
    variant: 'default' as const,
  },
  {
    name: 'Custom',
    price: 'Contact Us',
    period: '',
    description: 'Advanced solutions for agencies or enterprises',
    features: [
      'Multi-site management',
      'Advanced integrations',
      'Dedicated onboarding & training',
      'SLA & enhanced security options',
      '24/7 enterprise support',
      'Account manager assigned',
    ],
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
];

export function TrialExpiredScreen() {
  const navigate = useNavigate();

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Custom') {
      // Handle contact sales
      window.open('mailto:sales@naveeg.com?subject=Custom Plan Inquiry', '_blank');
    } else {
      // Navigate to subscription flow
      navigate({ to: '/dashboard/plans' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h1 className="font-sansation text-3xl md:text-4xl font-bold text-foreground mb-4">
            ⏰ Your trial has ended
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Subscribe now to keep your website live and unlock all features.
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative p-6 ${
                plan.popular 
                  ? 'border-primary bg-primary-light scale-105' 
                  : 'bg-card hover:shadow-medium transition-shadow'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="font-sansation text-2xl font-bold mb-2">
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handlePlanSelect(plan.name)}
                  className="w-full"
                  variant={plan.variant}
                  size="lg"
                >
                  {plan.cta}
                </Button>
                
                {plan.name !== 'Custom' && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    7-day free trial • Cancel anytime • VAT included
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help choosing? <a href="mailto:support@naveeg.com" className="text-primary hover:underline">Contact our team</a>
          </p>
        </div>
      </div>
    </div>
  );
}