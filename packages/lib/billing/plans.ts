export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    currency: 'EUR',
    interval: 'month',
    features: [
      '1 website',
      'Basic analytics',
      'PageSpeed Insights',
      'Email support'
    ],
    stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    features: [
      '1 website',
      'Advanced analytics',
      'PageSpeed Insights',
      'TenWeb integration',
      'Priority support',
      'Custom reporting'
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    popular: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Multiple websites',
      'Enterprise features',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    stripePriceId: '',
  },
];

export function getPlanById(id: string): BillingPlan | undefined {
  return BILLING_PLANS.find(plan => plan.id === id);
}

export function getPlanByStripePriceId(stripePriceId: string): BillingPlan | undefined {
  return BILLING_PLANS.find(plan => plan.stripePriceId === stripePriceId);
}

// Alias for backward compatibility
export const PLANS = BILLING_PLANS;

// Export PlanId type
export type PlanId = BillingPlan['id'];
