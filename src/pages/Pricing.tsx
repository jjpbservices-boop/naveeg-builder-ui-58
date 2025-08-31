import React from 'react'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { FAQ } from '@/components/ui/faq'
import { CTA } from '@/components/ui/cta'
import { pricingTiers } from '@/data/pricing'
import { setPageSEO } from '@/lib/seo'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = React.useState(false)

  React.useEffect(() => {
    setPageSEO({
      title: 'Pricing - Naveeg Website Builder',
      description: 'Simple, transparent pricing for Naveeg. Start free and scale as you grow. No hidden fees, ever.',
      keywords: 'pricing, website builder pricing, Naveeg pricing, website builder cost',
      ogImage: '/placeholders/og-image.jpg'
    })
  }, [])

  const faqItems = [
    {
      question: "Is there a free trial?",
      answer: "Yes! We offer a 7-day free trial for all plans. No credit card required to start building your website."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no questions asked. Your website will remain active until the end of your billing period."
    },
    {
      question: "What happens after my trial ends?",
      answer: "After your 7-day trial, you'll be automatically charged for the plan you selected. You can upgrade, downgrade, or cancel at any time."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with Naveeg, we'll refund your payment in full."
    },
    {
      question: "Can I change plans later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated."
    },
    {
      question: "Is VAT included in the price?",
      answer: "Yes, all prices include VAT where applicable. The price you see is the price you pay."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        description="Start free and scale as you grow. No hidden fees, ever."
        className="bg-muted/20"
      >
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual
            <Badge variant="accent" className="ml-2">
              Save 20%
            </Badge>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`card-clean card-clean-hover relative p-8 ${
                tier.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {tier.popular && (
                <Badge
                  variant="default"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-4">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {isAnnual ? `$${Math.round(parseInt(tier.price.replace('$', '')) * 0.8)}` : tier.price}
                  </span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
                <p className="text-muted-foreground">{tier.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                asChild
                className="w-full"
                variant={tier.popular ? "default" : "secondary"}
              >
                <a href={tier.href}>{tier.cta}</a>
              </Button>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-16">
          <div className="card-clean p-8 max-w-2xl mx-auto">
            <Star className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Need something custom?</h3>
            <p className="text-muted-foreground mb-6">
              We offer custom enterprise solutions for large organizations with specific requirements.
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section
        eyebrow="Frequently Asked Questions"
        title="Everything you need to know"
        description="Can't find the answer you're looking for? Contact our support team."
      >
        <FAQ items={faqItems} />
      </Section>

      {/* Final CTA */}
      <Section className="bg-gradient-to-br from-primary to-accent text-primary-contrast">
        <CTA
          headline="Ready to get started?"
          subcopy="Join thousands of businesses building their online presence with Naveeg. Start your free trial today!"
          primaryButton={{
            text: "Start Free Trial",
            href: "/get-started"
          }}
          secondaryLink={{
            text: "Book a Demo",
            href: "/demo"
          }}
        />
      </Section>
    </div>
  )
}