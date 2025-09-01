export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 49,
    currency: "€",
    band: "entry",
    cta: "Start Free Trial",
    popular: false,
    description: "Perfect for small businesses getting started",
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
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 99,
    currency: "€",
    band: "grow",
    cta: "Start Free Trial",
    popular: true,
    description: "For growing businesses needing more",
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
  {
    id: "custom",
    name: "Custom",
    priceMonthly: null,
    currency: "€",
    band: "custom",
    cta: "Contact Sales",
    popular: false,
    description: "Advanced solutions for agencies or enterprises",
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
] as const;

export type PlanId = "starter" | "pro" | "custom";
export type PlanBand = typeof PLANS[number]['band'];
