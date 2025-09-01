import { Section } from '../components/Section'
import { Hero } from '../components/sections/Hero'
import { WhyDark } from '../components/sections/WhyDark'
import { FeatureCard } from '../components/FeatureCard'
import { PricingCard } from '../components/PricingCard'
import FinalCTA from '../components/sections/FinalCTA'
import Icon from '../components/ui/Icon'

export default function Home() {
  const features = [
    {
      icon: "bot",
      title: "AI website generation",
      description: "Tell us about your business and we'll create a professional website in minutes.",
      details: ["Smart content generation", "Professional layouts", "Industry-specific designs"]
    },
    {
      icon: "server-cog",
      title: "Hosting + SSL + Backups",
      description: "Fast EU hosting with automatic SSL certificates and daily backups.",
      details: ["99.9% uptime guarantee", "Global CDN", "Automatic SSL"]
    },
    {
      icon: "panels-top-left",
      title: "Drag-and-drop editor",
      description: "Simple editing without technical skills. Change text, images, and layouts with ease.",
      details: ["Visual editor", "No coding required", "Real-time preview"]
    },
    {
      icon: "globe2",
      title: "Domain connection",
      description: "Connect your custom domain with one click. Professional branding for your business.",
      details: ["Custom domains", "DNS management", "Email forwarding"]
    },
    {
      icon: "key-round",
      title: "One-click WP auto-login",
      description: "One-click access to your WordPress admin panel. Full control when you need it.",
      details: ["Secure access", "Admin panel", "Plugin management"]
    },
    {
      icon: "bar-chart-3",
      title: "Simple analytics",
      description: "Track your website's performance with easy-to-understand metrics and insights.",
      details: ["Traffic overview", "PageSpeed scores", "Visitor insights"]
    }
  ]

  const testimonials = [
    {
      quote: "Naveeg built my restaurant website in 15 minutes. It looks professional and brings in customers every day.",
      name: "Sarah Chen",
      role: "Restaurant Owner"
    },
    {
      quote: "I had no idea how to build a website. Naveeg made it so simple, and it looks amazing!",
      name: "Marcus Rodriguez",
      role: "Fitness Trainer"
    },
    {
      quote: "The AI understood exactly what I wanted. My boutique website is beautiful and drives sales.",
      name: "Emma Thompson",
      role: "Boutique Owner"
    }
  ]

  return (
    <div>
      <Hero />
      <WhyDark />
      
      {/* How it works */}
      <Section variant="light">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 h-96 flex items-center justify-center">
              <Icon name="building2" className="w-16 h-16 text-gray-400" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="h2 mb-6">See how it works</h2>
            <p className="body mb-8">From idea to live website in three simple steps</p>
            <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </Section>

      {/* Features grid */}
      <Section variant="light">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">Everything you need to succeed online</h2>
          <p className="body max-w-2xl mx-auto">
            From AI-powered generation to professional hosting, we've got you covered
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section variant="light">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">Simple, transparent pricing</h2>
          <p className="body max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include our core features.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard planId="starter" />
          <PricingCard planId="pro" />
          <PricingCard planId="custom" />
        </div>
      </Section>

      {/* Testimonials */}
      <Section variant="light">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">Loved by business owners</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="card p-6">
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Icon key={j} name="star" className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-[var(--muted)] mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-[var(--muted)]">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <FinalCTA />
    </div>
  )
}
