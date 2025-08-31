import React from 'react'
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Rocket, 
  Zap, 
  Shield, 
  Smartphone, 
  Palette,
  MessageSquare,
  Sparkles,
  Globe,
  Users,
  BarChart3,
  FileText,
  Settings,
  HeadphonesIcon,
  Play
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

export default function Home() {
  const handleStartOnboarding = () => {
    // TODO: Implement onboarding flow
    console.log('Starting onboarding...')
  }

  const handleSeePricing = () => {
    // TODO: Navigate to pricing
    console.log('Navigating to pricing...')
  }

  const handleBookDemo = () => {
    // TODO: Implement demo booking
    console.log('Booking demo...')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        
        <div className="container-clean relative">
          <div className="section-clean-lg text-center">
            <div className="max-w-4xl mx-auto">
              {/* Eyebrow */}
              <Badge variant="accent" className="mb-8 px-4 py-2 text-sm">
                ✨ AI-Powered Website Builder
              </Badge>
              
              {/* Main Headline */}
              <h1 className="heading-display text-4xl sm:text-5xl lg:text-6xl mb-8 text-balance leading-tight">
                Launch a polished website in{' '}
                <span className="gradient-text">hours, not weeks</span>
              </h1>
              
              {/* Sub-headline */}
              <p className="text-lead mb-12 max-w-3xl mx-auto text-balance">
                Tell us about your business. Naveeg creates your site, hosts it, and keeps it fast. No tech skills needed.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button size="lg" onClick={handleStartOnboarding} className="text-lg px-8 py-4">
                  <Sparkles className="mr-3 h-5 w-5" />
                  Start free
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                <Button variant="secondary" size="lg" onClick={handleSeePricing} className="text-lg px-8 py-4">
                  See pricing
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  GDPR-ready
                </div>
                <div className="hidden sm:block text-muted-foreground/30">•</div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" />
                  Fast hosting
                </div>
                <div className="hidden sm:block text-muted-foreground/30">•</div>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <Section
        eyebrow="Trusted by local businesses and growing SMEs"
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
        <div className="grid-clean-4">
          <FeatureItem
            icon={MessageSquare}
            title="AI website setup"
            body="Answer a few questions. Get a complete site with pages, images, and text."
          />
          <FeatureItem
            icon={Shield}
            title="Managed WordPress hosting"
            body="Fast, secure, automatic backups with SSL and uptime monitoring included."
          />
          <FeatureItem
            icon={FileText}
            title="Simple editing"
            body="Change text and images like a document. No code required."
          />
          <FeatureItem
            icon={BarChart3}
            title="Built-in marketing basics"
            body="SEO, speed checks, and contact forms included to help you grow."
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
        <div className="grid-clean-3 max-w-6xl mx-auto">
          {[
            {
              icon: MessageSquare,
              step: "01",
              title: "Describe your business",
              description: "Name, services, and a short description."
            },
            {
              icon: Sparkles,
              step: "02", 
              title: "Generate your site",
              description: "We create pages, images, and copy you can edit."
            },
            {
              icon: Globe,
              step: "03",
              title: "Publish",
              description: "Go live on a free subdomain or connect your domain."
            }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {item.step}
                </div>
              </div>
              <h3 className="heading-display text-xl mb-4">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Deep Dives - Alternating */}
      <Section
        eyebrow="Built for Business Owners"
        title="Features that make sense for SMEs"
        description="Everything you need to succeed online, nothing you don't"
      >
        <div className="space-y-32">
          {/* Row 1 */}
          <div className="grid-clean-2 items-center">
            <div>
              <h3 className="heading-display text-3xl mb-6">Editor you can't break</h3>
              <p className="text-lead mb-8">
                Click, type, save. Undo any change. Our editor is designed so you can't accidentally break your site.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Visual editing with live preview</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Unlimited undo/redo</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Auto-save every change</span>
                </li>
              </ul>
            </div>
            <div className="card-clean p-12 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-16 w-16 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">Visual editor preview</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid-clean-2 items-center">
            <div className="lg:order-2">
              <h3 className="heading-display text-3xl mb-6">Speed & SEO</h3>
              <p className="text-lead mb-8">
                Automatic speed tests and simple tips to rank better. We handle the technical stuff so you don't have to.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Real-time speed monitoring</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">SEO checklist and tips</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Mobile optimization included</span>
                </li>
              </ul>
            </div>
            <div className="card-clean p-12 text-center group hover:scale-105 transition-transform duration-300 lg:order-1">
              <div className="w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-16 w-16 text-accent" />
              </div>
              <p className="text-muted-foreground font-medium">Performance dashboard</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid-clean-2 items-center">
            <div>
              <h3 className="heading-display text-3xl mb-6">One-click admin</h3>
              <p className="text-lead mb-8">
                Access WordPress admin safely when you need advanced changes. We keep it secure so you can focus on your business.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Secure admin access</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Plugin management</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Advanced customization</span>
                </li>
              </ul>
            </div>
            <div className="card-clean p-12 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-16 w-16 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">Admin panel access</p>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid-clean-2 items-center">
            <div className="lg:order-2">
              <h3 className="heading-display text-3xl mb-6">Security & backups</h3>
              <p className="text-lead mb-8">
                SSL, daily backups, and monitoring included. Your site is protected so you can sleep soundly.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">SSL certificates included</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Daily automated backups</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-lg">24/7 security monitoring</span>
                </li>
              </ul>
            </div>
            <div className="card-clean p-12 text-center group hover:scale-105 transition-transform duration-300 lg:order-1">
              <div className="w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-16 w-16 text-accent" />
              </div>
              <p className="text-muted-foreground font-medium">Security dashboard</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section
        eyebrow="What Our Customers Say"
        title="Real businesses, real results"
        description="See how Naveeg is helping SMEs get online and grow"
        className="bg-muted/20"
      >
        <div className="grid-clean-2 max-w-5xl mx-auto">
          {testimonials.slice(0, 2).map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </Section>

      {/* Pricing Preview */}
      <Section
        eyebrow="Simple Pricing"
        title="Start free, grow when you're ready"
        description="No setup fees. Cancel anytime. Choose the plan that fits your business."
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-8 text-xl font-semibold mb-8">
            <span>Starter €49/mo</span>
            <span className="text-muted-foreground">•</span>
            <span>Growth €99/mo</span>
            <span className="text-muted-foreground">•</span>
            <span>Business Custom</span>
          </div>
          <Button size="lg" onClick={handleSeePricing} className="text-lg px-8 py-4">
            See pricing
          </Button>
        </div>
      </Section>

      {/* Final CTA */}
      <CTA
        headline="Your website, done right."
        subcopy="Join thousands of SMEs who trust Naveeg to build and manage their online presence. No tech skills required."
        primaryButton={{
          text: "Start free",
          href: "/auth",
          loading: false
        }}
        secondaryLink={{
          text: "Book a demo",
          href: "/contact"
        }}
        className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"
      />
    </div>
  )
}