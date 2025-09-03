import { Plan } from './types'

export const PLANS = {
  starter: {
    name: 'Starter',
    eur: 49,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      'AI-generated website creation',
      'Hosting + SSL included',
      'Up to 5 pages',
      '1 free domain (first year)',
      'Daily backups & 1-click restore',
      'GDPR-compliant EU hosting',
      'Intuitive dashboard',
      'Email/chat support (business hours)'
    ]
  },
  pro: {
    name: 'Pro',
    eur: 99,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    mostPopular: true,
    features: [
      'Everything in Starter',
      'Unlimited pages + blog',
      'AI Copilot for content edits',
      'Built-in SEO and Analytics tools',
      'Marketing automations',
      'Priority support (chat + extended hours)',
      'Multi-language site setup',
      'Advanced customization',
      'Mobile SEO suggestions'
    ]
  },
  custom: {
    name: 'Custom',
    contact: true,
    features: [
      'Multi-site management',
      'Advanced integrations (APIs, workflows)',
      'Dedicated onboarding & training',
      'SLA & enhanced security options',
      '24/7 enterprise support',
      'Custom infrastructure & scalability',
      'Tailored feature roadmap',
      'Account manager'
    ]
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlanById(id: PlanId) {
  return PLANS[id]
}

export function getPlanByStripePrice(stripePriceId: string): PlanId | null {
  for (const [id, plan] of Object.entries(PLANS)) {
    if ('stripePriceId' in plan && plan.stripePriceId === stripePriceId) {
      return id as PlanId
    }
  }
  return null
}
