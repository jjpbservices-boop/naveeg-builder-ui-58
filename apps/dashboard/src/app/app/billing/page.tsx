'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@naveeg/ui';
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
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing</h1>
        <p className="text-gray-600">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
        
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentPlan.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <Icon 
                name={currentPlan.status === 'active' ? 'check-circle' : 'alert-circle'} 
                className="w-4 h-4 mr-1" 
              />
              {currentPlan.status === 'active' ? 'Active' : 'Past Due'}
            </span>
            
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
      </motion.div>

      {/* Available plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([planId, plan]) => {
            const isCurrentPlan = currentPlan.id === planId;
            const isUpgrade = planId === 'pro' && currentPlan.id === 'starter';
            
            return (
              <div
                key={planId}
                className={`relative p-6 border-2 rounded-xl transition-all duration-200 ${
                  isCurrentPlan
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {hasMostPopular(plan) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {hasContact(plan) ? 'Custom' : hasEur(plan) ? `€${plan.eur}` : 'Contact Sales'}
                  </div>
                  {!hasContact(plan) && hasEur(plan) && (
                    <div className="text-sm text-gray-500">
                      per month
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 6).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Icon name="check" className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planId as PlanId)}
                  disabled={isLoading || isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    isCurrentPlan
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isUpgrade
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : hasContact(plan)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 
                   hasContact(plan) ? 'Contact Sales' :
                   isUpgrade ? 'Upgrade Now' : 'Choose Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Billing information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h2>
        
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
      </motion.div>

      {/* Billing history */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h2>
        
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
