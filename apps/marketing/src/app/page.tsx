import { Hero } from '../components/sections/Hero'
import { WhyDark } from '../components/sections/WhyDark'
import { FinalCTA } from '../components/sections/FinalCTA'
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

      {/* HOW IT WORKS */}
      <Section variant="light">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn className="order-2 lg:order-1">
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 h-96 flex items-center justify-center">
              <Icon name="building2" className="w-16 h-16 text-gray-400" />
            </div>
          </FadeIn>
          
          <FadeIn className="order-1 lg:order-2">
            <h2 className="h2 mb-6">How it works</h2>
            <p className="body mb-8">From idea to live website in four simple steps</p>
            <Stagger className="space-y-4">
              {[
                "Describe your business – Just a few words.",
                "AI builds your WordPress site – Pages, content, and design generated instantly.",
                "Customize easily – Edit text, photos, and layout with drag-and-drop.",
                "Publish instantly – Hosting, SSL, backups, and SEO included."
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

      {/* FEATURES SECTION */}
      <Section variant="light">
        <Stagger className="text-center mb-16">
          <h2 className="h2 mb-4">All the tools you need to grow online</h2>
          <p className="body max-w-2xl mx-auto">From AI-powered generation to professional hosting, we&apos;ve got you covered</p>
        </Stagger>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[
            {
              icon: <Icon name="bot" className="w-6 h-6 text-neutral-800" />,
              title: "AI Website Generation",
              description: "A complete WordPress site created in minutes.",
              details: ["Smart content generation", "Professional layouts", "Industry-specific designs"]
            },
            {
              icon: <Icon name="panels-top-left" className="w-6 h-6 text-neutral-800" />,
              title: "Drag-and-Drop Editor",
              description: "Update text, images, and layouts as easily as email.",
              details: ["Visual editor", "No coding required", "Real-time preview"]
            },
            {
              icon: <Icon name="globe2" className="w-6 h-6 text-neutral-800" />,
              title: "Domain Connection",
              description: "Use your own domain with one click.",
              details: ["Custom domains", "DNS management", "Email forwarding"]
            },
            {
              icon: <Icon name="search" className="w-6 h-6 text-neutral-800" />,
              title: "SEO Optimization",
              description: "Optimized titles, speed, and structure to rank higher.",
              details: ["Meta tags", "Page speed", "Structured data"]
            },
            {
              icon: <Icon name="bar-chart-3" className="w-6 h-6 text-neutral-800" />,
              title: "Analytics Dashboard",
              description: "Track visitors, pages, and performance with simple reports.",
              details: ["Traffic overview", "PageSpeed scores", "Visitor insights"]
            },
            {
              icon: <Icon name="users" className="w-6 h-6 text-neutral-800" />,
              title: "Lead Generation",
              description: "Built-in forms and call-to-actions capture new customers.",
              details: ["Contact forms", "CTA buttons", "Lead tracking"]
            },
            {
              icon: <Icon name="zap" className="w-6 h-6 text-neutral-800" />,
              title: "Marketing Automations",
              description: "Send emails, reminders, or workflows automatically.",
              details: ["Email campaigns", "Follow-up sequences", "Customer journeys"]
            },
            {
              icon: <Icon name="server-cog" className="w-6 h-6 text-neutral-800" />,
              title: "Secure Hosting + SSL + Backups",
              description: "Reliable EU hosting with daily backups.",
              details: ["99.9% uptime guarantee", "Global CDN", "Automatic SSL"]
            },
            {
              icon: <Icon name="key-round" className="w-6 h-6 text-neutral-800" />,
              title: "One-Click WordPress Login",
              description: "Access full WordPress power when you need it.",
              details: ["Secure access", "Admin panel", "Plugin management"]
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

      {/* OUTCOMES SECTION - Dark */}
      <section className="section-y section-dark text-white relative overflow-hidden">
        <div className="container-max relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">
              Designed for real business results
            </h2>
            <p className="text-lg text-[var(--muted-light)] max-w-2xl mx-auto mb-12">
              Your WordPress website isn't just a digital business card – it's a growth engine that works 24/7 to bring you customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Icon name="search" className="w-6 h-6" />,
                title: "Get discovered on Google",
                description: "SEO-optimized pages help customers find you when they search for your services."
              },
              {
                icon: <Icon name="users" className="w-6 h-6" />,
                title: "Bring more customers every week",
                description: "Professional design and clear messaging convert visitors into paying customers."
              },
              {
                icon: <Icon name="shopping-cart" className="w-6 h-6" />,
                title: "Sell products or services online",
                description: "Full e-commerce with WooCommerce integration for online sales."
              },
              {
                icon: <Icon name="clock" className="w-6 h-6" />,
                title: "Save time with automations",
                description: "Automated emails, follow-ups, and workflows handle routine tasks."
              },
              {
                icon: <Icon name="edit" className="w-6 h-6" />,
                title: "Update whenever you want",
                description: "No developer needed – make changes instantly with our simple editor."
              },
              {
                icon: <Icon name="trending-up" className="w-6 h-6" />,
                title: "Scale as you grow",
                description: "From startup to enterprise, your website grows with your business."
              }
            ].map((outcome, i) => (
              <FadeIn key={i} delay={i * 0.1} className="text-center h-full">
                <div className="card-dark p-8 hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                  <div className="icon-container icon-container-accent mx-auto mb-6">
                    {outcome.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white min-h-[3rem] flex items-center justify-center">{outcome.title}</h3>
                  <p className="text-[var(--muted-light)] leading-relaxed flex-grow flex items-start justify-center">{outcome.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

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

      {/* TESTIMONIALS - Dark */}
      <section className="section-y section-dark text-white relative overflow-hidden">
        <div className="container-max relative z-10">
          <Stagger className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              Trusted by small business owners
            </h2>
          </Stagger>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah",
                role: "Restaurant Owner",
                content: "Naveeg built my restaurant site in 15 minutes. Customers find me on Google every day.",
                rating: 5
              },
              {
                name: "Marcus",
                role: "Fitness Trainer",
                content: "I never thought I could create a site. Naveeg made it simple, and I'm getting new leads weekly.",
                rating: 5
              },
              {
                name: "Emma",
                role: "Boutique Owner",
                content: "The AI created a beautiful site that reflects my boutique perfectly. Sales increased within weeks.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <FadeIn key={i} delay={i * 0.1} className="h-full">
                <div className="card-dark p-8 hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Icon key={j} name="star" className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-[var(--muted-light)] mb-6 italic text-lg leading-relaxed flex-grow flex items-start">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="mt-auto">
                    <p className="font-semibold text-white text-lg">{testimonial.name}</p>
                    <p className="text-sm text-[var(--muted-light)]">{testimonial.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <Section variant="light">
        <div className="text-center mb-16">
          <h2 className="h2 mb-6">Frequently Asked Questions</h2>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: "Why WordPress?",
              answer: "WordPress powers over 40% of websites worldwide. It's secure, flexible, and built for SEO. Naveeg makes it accessible without technical hassle."
            },
            {
              question: "Do I need technical skills?",
              answer: "No. If you can send an email, you can edit your website. Everything is drag-and-drop."
            },
            {
              question: "How is Naveeg different from other builders?",
              answer: "Other tools limit you to templates. Naveeg gives you a real WordPress site with SEO, analytics, and marketing tools included."
            },
            {
              question: "What happens after the free trial?",
              answer: "Choose a plan to keep your site live. If you cancel, the site goes offline. No contracts, cancel anytime."
            },
            {
              question: "Do I need a credit card to start?",
              answer: "No. The 7-day trial requires no payment info."
            },
            {
              question: "Can I use my own domain?",
              answer: "Yes. Connect your custom domain in one click."
            },
            {
              question: "Will my site rank on Google?",
              answer: "Yes. Naveeg creates SEO-friendly pages by default and helps you improve them with suggestions."
            },
            {
              question: "What about support?",
              answer: "Email and chat support are included. Pro plans get priority support with extended hours."
            }
          ].map((faq, i) => (
            <FadeIn key={i} delay={i * 0.1} className="card p-6">
              <h3 className="text-lg font-semibold mb-3 text-[var(--ink)]">{faq.question}</h3>
              <p className="text-[var(--muted)]">{faq.answer}</p>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <FinalCTA />
    </>
  )
}
