import React from 'react'
import { 
  Sparkles, 
  Palette, 
  Shield, 
  FileText, 
  BarChart3, 
  Search, 
  Zap, 
  HeadphonesIcon,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { FeatureItem } from '@/components/ui/feature-item'
import { CTA } from '@/components/ui/cta'

export default function Features() {
  const handleStartFree = () => {
    // TODO: Implement free trial signup
    console.log('Starting free trial...')
  }

  const features = [
    {
      icon: Sparkles,
      title: "AI builder",
      body: "Pages, structure, and copy from a short brief.",
      details: [
        "Answer simple questions about your business",
        "Get complete website structure",
        "AI-generated content in your voice",
        "Professional copywriting included"
      ]
    },
    {
      icon: Palette,
      title: "Design that fits",
      body: "Modern templates you can tweak without fear.",
      details: [
        "Professional templates designed by experts",
        "Customize colors, fonts, and layouts",
        "Mobile-first responsive design",
        "No design skills required"
      ]
    },
    {
      icon: Shield,
      title: "Hosting included",
      body: "Fast servers, SSL, backups, and uptime monitoring.",
      details: [
        "Global CDN for fast loading worldwide",
        "Automatic SSL certificates",
        "Daily automated backups",
        "99.9% uptime guarantee"
      ]
    },
    {
      icon: FileText,
      title: "Simple updates",
      body: "Edit text and images. Add pages when you're ready.",
      details: [
        "Visual editor like a document",
        "Drag and drop page building",
        "Real-time preview",
        "Unlimited undo/redo"
      ]
    },
    {
      icon: BarChart3,
      title: "Analytics & speed",
      body: "See visits and speed scores. Get clear fixes.",
      details: [
        "Built-in analytics dashboard",
        "Real-time speed monitoring",
        "Performance optimization tips",
        "Mobile performance tracking"
      ]
    },
    {
      icon: Search,
      title: "SEO basics",
      body: "Page titles, descriptions, and checklists you can follow.",
      details: [
        "SEO checklist and recommendations",
        "Meta title and description editor",
        "Keyword optimization tips",
        "Search engine submission help"
      ]
    },
    {
      icon: Zap,
      title: "Integrations",
      body: "Google Analytics, Search Console, Stripe checkout, and more.",
      details: [
        "Google Analytics 4 integration",
        "Stripe payment processing",
        "Mailchimp email marketing",
        "Zapier automation support"
      ]
    },
    {
      icon: HeadphonesIcon,
      title: "Support that answers",
      body: "Human help if you get stuck.",
      details: [
        "Email support for all plans",
        "Priority support for Growth+",
        "Video tutorials and guides",
        "Community forum access"
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section
        eyebrow="Product Features"
        title="Everything you need to get online and grow"
        description="Website creation, hosting, editing, and essential marketing in one place."
        className="text-center pt-32"
      >
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-lead">
            Built specifically for business owners who want to focus on growth, not technology. 
            Naveeg handles the complex stuff so you can focus on what matters most.
          </p>
        </div>

        <Button size="lg" onClick={handleStartFree}>
          Start free
        </Button>
      </Section>

      {/* Features Grid */}
      <Section
        eyebrow="Core Features"
        title="Built for business owners, not developers"
        description="Everything you need to succeed online, nothing you don't"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="card-clean p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="heading-display text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.body}</p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section
        eyebrow="How It Works"
        title="From idea to live website in minutes"
        description="Our simple 3-step process gets you online fast"
        className="bg-muted/20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            {
              step: "01",
              title: "Describe your business",
              description: "Tell us about your company, services, and what makes you special. Use simple, everyday language.",
              icon: Sparkles
            },
            {
              step: "02", 
              title: "AI generates your site",
              description: "Our AI creates your complete website with content, design, and images. Everything is done for you.",
              icon: Palette
            },
            {
              step: "03",
              title: "Launch & optimize",
              description: "Your website goes live instantly. Update content easily through our simple dashboard.",
              icon: Shield
            }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {item.step}
                </div>
              </div>
              <h3 className="heading-display text-xl mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
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