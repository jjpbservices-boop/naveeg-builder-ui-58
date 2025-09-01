import { Hero } from '../components/sections/Hero'
import { WhyDark } from '../components/sections/WhyDark'
import FinalCTA from '../components/sections/FinalCTA'
import { FeatureCard } from '../components/FeatureCard'
import { PricingCard } from '../components/PricingCard'
import { Section } from '../components/Section'
import { FadeIn, Stagger } from '../components/ui/Motion'
import { PLANS } from '../data/pricing.config'
import Link from 'next/link'
import Icon from '../components/ui/Icon'

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <Hero />

      {/* VALUE PILLARS - Now WhyDark component */}
      <WhyDark />

      {/* PRODUCT TOUR */}
      <Section variant="light">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn className="order-2 lg:order-1">
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 h-96 flex items-center justify-center">
              <Icon name="building2" className="w-16 h-16 text-gray-400" />
            </div>
          </FadeIn>
          
          <FadeIn className="order-1 lg:order-2">
            <h2 className="h2 mb-6">See how it works</h2>
            <p className="body mb-8">From idea to live website in three simple steps</p>
            <Stagger className="space-y-4">
              {[
                "Generate your website with AI in minutes",
                "Edit content and design with our simple editor",
                "Publish instantly with hosting and SSL included"
              ].map((step, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{i + 1}</span>
                  </div>
                  <p className="text-[var(--muted)]">{step}</p>
                </div>
              ))}
            </Stagger>
          </FadeIn>
        </div>
      </Section>

      {/* FEATURE GRID */}
      <Section variant="light">
        <Stagger className="text-center mb-16">
          <h2 className="h2 mb-4">Everything you need to succeed online</h2>
          <p className="body max-w-2xl mx-auto">From AI-powered generation to professional hosting, we&apos;ve got you covered</p>
        </Stagger>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[
            {
              icon: <Icon name="bot" className="size-6 text-neutral-800" />,
              title: "AI website generation",
              description: "Tell us about your business and we'll create a professional website in minutes.",
              details: ["Smart content generation", "Professional layouts", "Industry-specific designs"]
            },
            {
              icon: <Icon name="server-cog" className="size-6 text-neutral-800" />,
              title: "Hosting + SSL + Backups",
              description: "Fast EU hosting with automatic SSL certificates and daily backups.",
              details: ["99.9% uptime guarantee", "Global CDN", "Automatic SSL"]
            },
            {
              icon: <Icon name="panels-top-left" className="size-6 text-neutral-800" />,
              title: "Drag-and-drop editor",
              description: "Simple editing without technical skills. Change text, images, and layouts with ease.",
              details: ["Visual editor", "No coding required", "Real-time preview"]
            },
            {
              icon: <Icon name="globe2" className="size-6 text-neutral-800" />,
              title: "Domain connection",
              description: "Connect your custom domain with one click. Professional branding for your business.",
              details: ["Custom domains", "DNS management", "Email forwarding"]
            },
            {
              icon: <Icon name="key-round" className="size-6 text-neutral-800" />,
              title: "One-click WP auto-login",
              description: "One-click access to your WordPress admin panel. Full control when you need it.",
              details: ["Secure access", "Admin panel", "Plugin management"]
            },
            {
              icon: <Icon name="bar-chart-3" className="size-6 text-neutral-800" />,
              title: "Simple analytics",
              description: "Track your website's performance with easy-to-understand metrics and insights.",
              details: ["Traffic overview", "PageSpeed scores", "Visitor insights"]
            }
          ].map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              details={feature.details}
            />
          ))}
        </div>
      </Section>

      {/* PRICING TEASER */}
      <Section variant="light">
        <Stagger className="text-center mb-16">
          <h2 className="h2 mb-4">Simple, transparent pricing</h2>
          <p className="body max-w-2xl mx-auto">Choose the plan that fits your business. All plans include our core features.</p>
        </Stagger>
        
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard planId="starter" />
          <PricingCard planId="pro" />
          <PricingCard planId="custom" />
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section variant="light">
        <Stagger className="text-center mb-16">
          <h2 className="h2 mb-4">Loved by business owners</h2>
        </Stagger>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Restaurant Owner",
              content: "Naveeg built my restaurant website in 15 minutes. It looks professional and brings in customers every day.",
              rating: 5
            },
            {
              name: "Marcus Rodriguez",
              role: "Fitness Trainer",
              content: "I had no idea how to build a website. Naveeg made it so simple, and it looks amazing!",
              rating: 5
            },
            {
              name: "Emma Thompson",
              role: "Boutique Owner",
              content: "The AI understood exactly what I wanted. My boutique website is beautiful and drives sales.",
              rating: 5
            }
          ].map((testimonial, i) => (
            <FadeIn key={i} delay={i * 0.1} className="card p-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Icon key={j} name="star" className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-[var(--muted)] mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-[var(--muted)]">{testimonial.role}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <FinalCTA />
    </>
  )
}
