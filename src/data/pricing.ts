import { PricingTier } from "@/components/ui/pricing-table"

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$29",
    period: "month",
    description: "Perfect for small businesses getting started online",
    features: [
      "AI-powered website generation",
      "WordPress hosting included",
      "SSL certificate",
      "Mobile-responsive design",
      "Basic SEO optimization",
      "Email support",
      "7-day free trial"
    ],
    cta: "Start Free Trial",
    href: "/get-started"
  },
  {
    name: "Pro",
    price: "$79",
    period: "month",
    description: "Everything you need to scale your business online",
    popular: true,
    features: [
      "Everything in Starter",
      "Advanced AI customization",
      "E-commerce integration",
      "Advanced SEO tools",
      "Analytics dashboard",
      "Priority support",
      "Custom domain management",
      "30-day free trial"
    ],
    cta: "Start Free Trial",
    href: "/get-started"
  }
]

export const pricingFeatures = [
  "AI-powered website generation",
  "WordPress hosting included",
  "SSL certificate",
  "Mobile-responsive design",
  "SEO optimization",
  "E-commerce integration",
  "Analytics dashboard",
  "Priority support",
  "Custom domain management",
  "7-day free trial"
]
