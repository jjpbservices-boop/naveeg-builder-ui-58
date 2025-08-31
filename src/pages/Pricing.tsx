import React, { useState } from 'react'
import { CheckCircle, Star, Zap, Shield, Globe, CreditCard, HeadphonesIcon, Settings, BarChart3, FileText, Users, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { CTA } from '@/components/ui/cta'

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: "Starter",
      price: "€49",
      period: "/mo",
      description: "For first websites and local businesses",
      popular: false,
      features: [
        "AI website setup",
        "Managed WordPress hosting + SSL",
        "5 pages",
        "Free subdomain or connect your domain",
        "Basic SEO and speed checks",
        "Daily backups",
        "Email support"
      ],
      cta: "Start free",
      ctaVariant: "default" as const
    },
    {
      name: "Growth",
      price: "€99",
      period: "/mo",
      description: "For growing SMEs",
      popular: true,
      features: [
        "Everything in Starter",
        "Unlimited pages",
        "Blog",
        "Online payments (Stripe) or bookings",
        "Priority support",
        "Advanced SEO tips and speed reports"
      ],
      cta: "Start free",
      ctaVariant: "default" as const
    },
    {
      name: "Business",
      price: "Custom",
      period: "",
      description: "For businesses that need more",
      popular: false,
      features: [
        "Everything in Growth",
        "Custom integrations",
        "Onboarding help",
        "Dedicated support"
      ],
      cta: "Talk to sales",
      ctaVariant: "secondary" as const
    }
  ]

  const handleStartFree = () => {
    // TODO: Implement free trial signup
    console.log('Starting free trial...')
  }

  const handleTalkToSales = () => {
    // TODO: Implement sales contact
    console.log('Contacting sales...')
  }

  const handleCtaClick = (plan: typeof plans[0]) => {
    if (plan.name === "Business") {
      handleTalkToSales()
    } else {
      handleStartFree()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section
        eyebrow="Simple Pricing"
        title="Simple plans. No setup fees. Cancel anytime."
        description="Start free and choose the plan that fits your business. No hidden costs, no surprises."
        className="text-center pt-32"
      >
        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-16 h-8 rounded-full transition-colors duration-200 ${
              isYearly ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                isYearly ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="ml-1 text-xs text-primary font-medium">(save 2 months)</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative card-clean p-8 ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-xl scale-105' 
                  : 'hover:scale-105'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="heading-display text-2xl mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {isYearly && plan.name !== "Business" 
                      ? `€${Math.round(parseInt(plan.price.replace('€', '')) * 10 / 12)}`
                      : plan.price
                    }
                  </span>
                  <span className="text-muted-foreground">
                    {isYearly && plan.name !== "Business" ? "/mo" : plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.ctaVariant}
                size="lg"
                className="w-full"
                onClick={() => handleCtaClick(plan)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Legal Note */}
        <div className="text-center text-sm text-muted-foreground mb-8">
          <p>14-day free trial on a Naveeg subdomain. No credit card required to start.</p>
          <p className="mt-2">Prices exclude VAT where applicable.</p>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section
        eyebrow="Frequently Asked Questions"
        title="Everything you need to know"
        description="Common questions about Naveeg's pricing and service"
        className="bg-muted/20"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {[
            {
              question: "Do I need any tech skills?",
              answer: "No. If you can type an email, you can update your site."
            },
            {
              question: "Can I use my domain?",
              answer: "Yes. Start on a free subdomain and connect your domain any time."
            },
            {
              question: "Can I switch plans?",
              answer: "Yes, upgrade or downgrade from your account."
            },
            {
              question: "Is hosting included?",
              answer: "Yes. SSL and backups too."
            },
            {
              question: "What happens after the trial?",
              answer: "Pick a plan to stay live. If not, your site pauses."
            },
            {
              question: "Do you offer refunds?",
              answer: "Monthly plans are pay-as-you-go. Talk to us if something goes wrong."
            }
          ].map((faq, index) => (
            <div key={index} className="card-clean p-6">
              <h3 className="font-semibold mb-3">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <CTA
        headline="Ready to get started?"
        subcopy="Join thousands of SMEs who trust Naveeg to build and manage their online presence. Start your free trial today."
        primaryButton={{
          text: "Start free",
          href: "/auth",
          loading: false
        }}
        secondaryLink={{
          text: "Book a demo",
          href: "/contact"
        }}
      />
    </div>
  )
}