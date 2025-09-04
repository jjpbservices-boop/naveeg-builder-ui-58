'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon, Card, Badge, PlanCard } from '@naveeg/ui';
import { PLANS, getPlanById, type PlanId } from '@naveeg/lib';

interface CurrentPlan {
  id: PlanId;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd?: string;
  stripeCustomerId?: string;
}

// Type guards for plan properties
function hasEur(plan: any): plan is { eur: number } {
  return 'eur' in plan;
}

function hasContact(plan: any): plan is { contact: true } {
  return 'contact' in plan && plan.contact === true;
}

function hasMostPopular(plan: any): plan is { mostPopular: true } {
  return 'mostPopular' in plan && plan.mostPopular === true;
}

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan>({
    id: 'starter',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === 'custom') {
      // Open contact form or redirect to sales
      window.open('mailto:sales@naveeg.com?subject=Custom Plan Inquiry', '_blank');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Create Stripe Checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to get portal URL');
      }
    } catch (error) {
      console.error('Error getting portal URL:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans">Billing</h1>
        <p className="text-gray-600">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current plan */}
      <Card gradient="blue" hover>
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="crown" className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="crown" className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getPlanById(currentPlan.id)?.name} Plan
              </h3>
              <p className="text-gray-600">
                {currentPlan.status === 'active' ? 'Active subscription' : 'Subscription issues'}
              </p>
              {currentPlan.currentPeriodEnd && (
                <p className="text-sm text-gray-500">
                  Next billing: {formatDate(currentPlan.currentPeriodEnd)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={currentPlan.status === 'active' ? 'success' : 'error'}>
              <Icon 
                name={currentPlan.status === 'active' ? 'check-circle' : 'alert-circle'} 
                className="w-4 h-4 mr-1" 
              />
              {currentPlan.status === 'active' ? 'Active' : 'Past Due'}
            </Badge>
            
            {currentPlan.stripeCustomerId && (
              <button
                onClick={handleManageBilling}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                Manage Billing
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Available plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([planId, plan]) => {
            const isCurrentPlan = currentPlan.id === planId;
            const isUpgrade = planId === 'pro' && currentPlan.id === 'starter';
            
            const gradientMap = {
              starter: 'green' as const,
              pro: 'blue' as const,
              custom: 'purple' as const,
            };
            
            return (
              <PlanCard
                key={planId}
                name={plan.name}
                price={hasContact(plan) ? 'Custom' : hasEur(plan) ? `€${plan.eur}` : 'Contact Sales'}
                period={hasContact(plan) ? '' : hasEur(plan) ? '/month' : ''}
                description={
                  planId === 'starter' ? 'Perfect for getting started' :
                  planId === 'pro' ? 'Advanced features for growing businesses' :
                  'Tailored solution for your needs'
                }
                features={plan.features.slice(0, 6)}
                current={isCurrentPlan}
                popular={hasMostPopular(plan)}
                gradient={gradientMap[planId as keyof typeof gradientMap]}
                buttonText={
                  isCurrentPlan ? 'Current Plan' : 
                  hasContact(plan) ? 'Contact Sales' :
                  isUpgrade ? 'Upgrade Now' : 'Choose Plan'
                }
                buttonVariant={isCurrentPlan ? 'secondary' : 'primary'}
                onButtonClick={() => handleUpgrade(planId as PlanId)}
              />
            );
          })}
        </div>
      </div>

      {/* Billing information */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="credit-card" className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Icon name="credit-card" className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">•••• •••• •••• 4242</span>
              <span className="text-sm text-gray-500">Expires 12/25</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Address
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-900">123 Main St</p>
              <p className="text-gray-900">Apt 4B</p>
              <p className="text-gray-900">New York, NY 10001</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing history */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="file-text" className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-600">
                  <span suppressHydrationWarning>
                    {new Date().toLocaleDateString()}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  Starter Plan - Monthly
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  €49.00
                </td>
                <td className="py-3 px-4">
                  <Badge variant="success" size="sm">Paid</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
