export const PLANS = {
  starter: {
    id: "starter",
    priceMonthly: 49,
    stripePriceId: process.env.NEXT_PUBLIC_PRICE_STARTER,
    features: [
      "AI-generated website creation",
      "Hosting + SSL included",
      "Up to 5 pages",
      "1 free domain (first year)",
      "Daily backups & 1-click restore",
      "GDPR-compliant EU hosting",
      "Intuitive dashboard (edit text & images)",
      "Email/chat support (business hours)"
    ]
  },
  pro: {
    id: "pro",
    priceMonthly: 99,
    stripePriceId: process.env.NEXT_PUBLIC_PRICE_PRO,
    features: [
      "Everything in Starter",
      "Unlimited pages + blog",
      "AI Copilot for content edits",
      "Built-in SEO and Analytics tools",
      "Marketing Automations (emails, workflows)",
      "Priority support (chat + extended hours)",
      "Multi-language site setup",
      "Advanced customization (fonts, layouts)",
      "Mobile SEO suggestions"
    ]
  },
  custom: {
    id: "custom",
    features: [
      "Multi-site management",
      "Advanced integrations (APIs, custom workflows)",
      "Dedicated onboarding & training",
      "SLA & enhanced security options",
      "24/7 enterprise support",
      "Custom infrastructure & scalability",
      "Tailored feature roadmap",
      "Account manager assigned"
    ]
  }
} as const;

export type PlanId = keyof typeof PLANS;
