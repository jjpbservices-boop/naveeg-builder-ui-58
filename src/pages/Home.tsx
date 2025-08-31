import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Shield, 
  Clock, 
  Settings, 
  Headphones, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Smartphone,
  Palette,
  Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { FeatureItem } from '@/components/ui/feature-item'
import { LogoCloud } from '@/components/ui/logo-cloud'
import { Testimonial } from '@/components/ui/testimonial'
import { CTA } from '@/components/ui/cta'
import { companyLogos } from '@/data/logos'
import { testimonials } from '@/data/testimonials'
import { setPageSEO } from '@/lib/seo'

export default function Home() {
  const navigate = useNavigate()

  React.useEffect(() => {
    setPageSEO({
      title: 'Naveeg - Build Your Website As Easy as Sending an Email',
      description: 'AI-powered website builder for business owners. Create professional WordPress websites in minutes with no technical skills required.',
      keywords: 'website builder, AI website, WordPress, business website, no-code website',
      ogImage: '/placeholders/og-image.jpg'
    })
  }, [])

  const handleStartOnboarding = () => {
    navigate({ to: '/brief' })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/5 to-background">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container-clean relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <Badge variant="accent" className="mb-6">
              ✨ AI-Powered Website Builder
            </Badge>
            
            {/* Main Headline */}
            <h1 className="heading-display text-display-1 mb-6 text-balance">
              Ship production-grade websites{' '}
              <span className="gradient-text">10× faster</span>
            </h1>
            
            {/* Subcopy */}
            <p className="text-lead mb-10 max-w-3xl mx-auto text-balance">
              From AI scaffolding to one-click deploys — build, test, and launch in hours, not weeks. 
              No technical knowledge required.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="xl" onClick={handleStartOnboarding}>
                <Sparkles className="mr-3 h-5 w-5" />
                Get Started
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button variant="secondary" size="xl">
                Book Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                7-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" />
                Launch in minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <Section
        eyebrow="Trusted by Industry Leaders"
        title="Join thousands of businesses worldwide"
        description="Companies trust Naveeg to build their online presence"
        className="bg-muted/20"
      >
        <LogoCloud logos={companyLogos} />
      </Section>

      {/* Value Props */}
      <Section
        eyebrow="Why Choose Naveeg"
        title="Everything you need to succeed online"
        description="Built specifically for business owners who want to focus on growth, not technology"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureItem
            icon={Zap}
            title="Lightning Fast"
            body="Build and deploy your website in minutes, not days. Our AI handles the heavy lifting."
          />
          <FeatureItem
            icon={Shield}
            title="Enterprise Security"
            body="Bank-level security with SSL certificates, automatic backups, and DDoS protection."
          />
          <FeatureItem
            icon={Smartphone}
            title="Mobile First"
            body="Every website is automatically optimized for mobile devices and all screen sizes."
          />
          <FeatureItem
            icon={Palette}
            title="Beautiful Design"
            body="Professional templates designed by experts. Customize colors, fonts, and layouts easily."
          />
        </div>
      </Section>

      {/* How It Works */}
      <Section
        eyebrow="How It Works"
        title="As simple as 1, 2, 3"
        description="Building a website has never been easier. No technical skills required."
        className="bg-muted/20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {[
            {
              icon: MessageSquare,
              step: "01",
              title: "Describe Your Business",
              description: "Tell us about your company, services, and what makes you special. Use simple, everyday language."
            },
            {
              icon: Sparkles,
              step: "02",
              title: "AI Generates Your Site",
              description: "Our AI creates your complete website with content, design, and images. Everything is done for you."
            },
            {
              icon: Rocket,
              step: "03",
              title: "Launch & Optimize",
              description: "Your website goes live instantly. Update content easily through our simple dashboard."
            }
          ].map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow-lg">
                  {step.step}
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              
              <div className="card-clean card-clean-hover p-8 h-full">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Deep Dive - Split Sections */}
      <Section
        eyebrow="Advanced Features"
        title="Built for scale and performance"
        description="Enterprise-grade features that grow with your business"
      >
        <div className="space-y-24">
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="heading-display text-display-4 mb-6">
                AI-Powered Content Generation
              </h3>
              <p className="text-lead mb-6">
                Our AI understands your business and creates compelling content that converts visitors into customers.
              </p>
              <ul className="space-y-3">
                {[
                  "SEO-optimized content that ranks",
                  "Professional copywriting in your voice",
                  "Automatic content updates",
                  "Multi-language support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-border/50 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">AI Content Preview</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h3 className="heading-display text-display-4 mb-6">
                One-Click Deploy & Hosting
              </h3>
              <p className="text-lead mb-6">
                Deploy your website to our global CDN with automatic SSL, backups, and performance optimization.
              </p>
              <ul className="space-y-3">
                {[
                  "Global CDN for lightning-fast loading",
                  "Automatic SSL certificates",
                  "Daily backups and version control",
                  "99.9% uptime guarantee"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative lg:order-1">
              <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl border border-border/50 flex items-center justify-center">
                <div className="text-center">
                  <Rocket className="h-16 w-16 text-accent mx-auto mb-4" />
                  <p className="text-muted-foreground">Deploy Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section
        eyebrow="Customer Success"
        title="What our customers say"
        description="Join thousands of business owners who've transformed their online presence"
        className="bg-muted/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              avatar={testimonial.avatar}
              name={testimonial.name}
              role={testimonial.role}
              quote={testimonial.quote}
              logo={testimonial.logo}
              company={testimonial.company}
            />
          ))}
        </div>
      </Section>

      {/* Integrations */}
      <Section
        eyebrow="Integrations"
        title="Works with your favorite tools"
        description="Connect Naveeg with the services you already use and love"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-4xl mx-auto">
          {[
            { name: "Stripe", icon: "💳" },
            { name: "Mailchimp", icon: "📧" },
            { name: "Google Analytics", icon: "📊" },
            { name: "Zapier", icon: "🔗" },
            { name: "Shopify", icon: "🛍️" },
            { name: "HubSpot", icon: "🎯" }
          ].map((integration, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors duration-200">
                <span className="text-2xl">{integration.icon}</span>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                {integration.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing Preview */}
      <Section
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        description="Start free and scale as you grow. No hidden fees, ever."
        className="bg-muted/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: "Starter",
              price: "$29",
              period: "/month",
              description: "Perfect for small businesses",
              features: ["AI website generation", "WordPress hosting", "SSL certificate", "Mobile responsive"]
            },
            {
              name: "Pro",
              price: "$79",
              period: "/month",
              description: "Everything you need to scale",
              features: ["Everything in Starter", "E-commerce integration", "Advanced SEO tools", "Priority support"]
            }
          ].map((plan, index) => (
            <div key={index} className="card-clean card-clean-hover p-8 text-center">
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-2 mb-8 text-left">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full">
                See Pricing
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section 
        title="Ready to build your dream website?"
        className="bg-gradient-to-br from-primary to-accent text-primary-contrast"
      >
        <CTA
          headline="Ready to build your dream website?"
          subcopy="Join thousands of businesses who've transformed their online presence with Naveeg. Start building today!"
          primaryButton={{
            text: "Start Building Now",
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