import React, { useState } from 'react'
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Phone, 
  ShoppingCart, 
  CreditCard, 
  Receipt, 
  Users,
  Zap,
  Shield,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { CTA } from '@/components/ui/cta'

export default function Solutions() {
  const [activeTab, setActiveTab] = useState('local-services')

  const solutions = {
    'local-services': {
      title: "Local services",
      subtitle: "plumbers, salons, cafés",
      outcome: "Get found, get booked, and keep info up to date.",
      highlights: [
        "Menu/services pages",
        "Opening hours",
        "Contact form",
        "Maps integration"
      ],
      proof: "Fast pages and clear calls to action.",
      cta: "Start free",
      icon: MapPin,
      color: "from-blue-500 to-cyan-500"
    },
    'small-shops': {
      title: "Small online shops",
      subtitle: "e-commerce for growing businesses",
      outcome: "List products and accept payments.",
      highlights: [
        "Product pages",
        "Secure checkout",
        "Receipts & invoices",
        "Inventory management"
      ],
      proof: "Simple flow for first-time buyers.",
      cta: "Start free",
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500"
    },
    'agencies': {
      title: "Agencies using Naveeg",
      subtitle: "for clients (no white label)",
      outcome: "Build faster. Hand off a simple editor clients can use.",
      highlights: [
        "AI start",
        "Professional templates",
        "Client roles",
        "Staged publishing"
      ],
      proof: "Efficient workflow for client projects.",
      cta: "Talk to sales",
      icon: Users,
      color: "from-purple-500 to-pink-500"
    }
  }

  const activeSolution = solutions[activeTab as keyof typeof solutions]

  const handleStartFree = () => {
    // TODO: Implement free trial signup
    console.log('Starting free trial...')
  }

  const handleTalkToSales = () => {
    // TODO: Implement sales contact
    console.log('Contacting sales...')
  }

  const handleCtaClick = () => {
    if (activeTab === 'agencies') {
      handleTalkToSales()
    } else {
      handleStartFree()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section
        eyebrow="Solutions"
        title="Built for your business type"
        description="Different solutions for different needs. All designed for business owners, not developers."
        className="text-center pt-32"
      />

      {/* Tabs Navigation */}
      <Section className="pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2 p-2 bg-muted/20 rounded-xl">
            {Object.entries(solutions).map(([key, solution]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{solution.title}</div>
                  <div className="text-xs opacity-75">{solution.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Active Solution Content */}
      <Section className="pt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="mb-8">
                <div className={`w-16 h-16 bg-gradient-to-r ${activeSolution.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <activeSolution.icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="heading-display text-3xl mb-4">{activeSolution.title}</h2>
                <p className="text-lead mb-6">{activeSolution.outcome}</p>
              </div>

              <div className="mb-8">
                <h3 className="heading-display text-xl mb-4">Highlights</h3>
                <ul className="space-y-3">
                  {activeSolution.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="heading-display text-xl mb-4">Proof</h3>
                <p className="text-muted-foreground">{activeSolution.proof}</p>
              </div>

              {activeTab === 'agencies' && (
                <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> No white-label. Your clients see "Powered by Naveeg."
                  </p>
                </div>
              )}

              <Button size="lg" onClick={handleCtaClick}>
                {activeSolution.cta}
              </Button>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className={`aspect-square bg-gradient-to-br ${activeSolution.color} rounded-3xl p-8 flex items-center justify-center`}>
                <div className="text-center text-white">
                  <activeSolution.icon className="h-32 w-32 mx-auto mb-6 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">{activeSolution.title}</h3>
                  <p className="opacity-90">{activeSolution.subtitle}</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-background rounded-2xl shadow-lg flex items-center justify-center">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-background rounded-xl shadow-lg flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Additional Benefits */}
      <Section
        eyebrow="Why Choose Naveeg"
        title="Built for business owners, not developers"
        description="Everything you need to succeed online, nothing you don't"
        className="bg-muted/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Zap,
              title: "Fast setup",
              description: "From idea to live website in minutes, not days."
            },
            {
              icon: Shield,
              title: "No technical debt",
              description: "Built on WordPress, maintained by experts."
            },
            {
              icon: Globe,
              title: "Always accessible",
              description: "Update your site from anywhere, anytime."
            }
          ].map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="heading-display text-xl mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <CTA
        headline="Ready to get started?"
        subcopy="Choose the solution that fits your business and start building your online presence today."
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