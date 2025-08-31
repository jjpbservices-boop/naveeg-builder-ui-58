import React from 'react'
import { 
  Heart, 
  Zap, 
  Users, 
  CheckCircle,
  Mail,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { CTA } from '@/components/ui/cta'

export default function About() {
  const handleContactUs = () => {
    // TODO: Implement contact form
    console.log('Opening contact form...')
  }

  const values = [
    {
      icon: Heart,
      title: "Clarity",
      description: "Plain language. Clear steps.",
      details: [
        "Simple explanations for complex features",
        "Step-by-step guides for everything",
        "No technical jargon",
        "Clear pricing and terms"
      ]
    },
    {
      icon: Zap,
      title: "Speed",
      description: "Fast setup. Fast pages.",
      details: [
        "Website creation in minutes",
        "Lightning-fast hosting",
        "Quick content updates",
        "Rapid support responses"
      ]
    },
    {
      icon: Users,
      title: "Care",
      description: "Real humans when you need help.",
      details: [
        "Human support team",
        "Personal onboarding assistance",
        "Understanding of business needs",
        "Long-term partnership focus"
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section
        eyebrow="About Naveeg"
        title="We build websites for people who don't build websites"
        description="Naveeg exists for small teams with big goals and no IT department. We remove the setup stress so you can focus on work."
        className="text-center pt-32"
      >
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-lead">
            Every business needs a website, but not every business has a developer. 
            We're changing that by making professional websites accessible to everyone.
          </p>
        </div>

        <Button size="lg" onClick={handleContactUs}>
          Contact us
        </Button>
      </Section>

      {/* Our Story */}
      <Section
        eyebrow="Our Story"
        title="How it all started"
        description="The journey from frustration to innovation"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="heading-display text-2xl mb-6">The Problem</h3>
              <p className="text-lead mb-6">
                We saw business owners struggling with website creation. They either had to:
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 dark:text-red-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">Pay thousands for custom development</p>
                    <p className="text-sm text-muted-foreground">Expensive and slow</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 dark:text-red-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">Use DIY builders that were too complex</p>
                    <p className="text-sm text-muted-foreground">Frustrating and limiting</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 dark:text-red-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">Give up and stay offline</p>
                    <p className="text-sm text-muted-foreground">Missing opportunities</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-muted/20 rounded-2xl p-8 text-center">
              <MessageSquare className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">The old way of building websites</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
            <div className="lg:order-2">
              <h3 className="heading-display text-2xl mb-6">The Solution</h3>
              <p className="text-lead mb-6">
                We built Naveeg to bridge the gap between professional websites and business owners.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>AI-powered website generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Simple editing for non-technical users</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Professional hosting and maintenance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Affordable pricing for small businesses</span>
                </li>
              </ul>
            </div>
            <div className="bg-muted/20 rounded-2xl p-8 text-center lg:order-1">
              <Zap className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">The Naveeg way</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Values */}
      <Section
        eyebrow="Our Values"
        title="What drives us forward"
        description="The principles that guide everything we do"
        className="bg-muted/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <div key={index} className="card-clean p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <value.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="heading-display text-xl mb-4">{value.title}</h3>
              <p className="text-lead mb-6">{value.description}</p>
              <ul className="space-y-3 text-left">
                {value.details.map((detail, detailIndex) => (
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

      {/* Team Section */}
      <Section
        eyebrow="Our Team"
        title="Small team, big impact"
        description="We're a focused team passionate about making websites accessible to everyone"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lead mb-8">
            We're a small, dedicated team of designers, developers, and business experts 
            who believe that every business deserves a professional online presence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              {
                role: "Design & UX",
                description: "Creating interfaces that make sense to business owners"
              },
              {
                role: "Development",
                description: "Building robust, scalable solutions that just work"
              },
              {
                role: "Business",
                description: "Understanding what SMEs actually need to succeed online"
              }
            ].map((team, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold mb-2">{team.role}</h4>
                <p className="text-sm text-muted-foreground">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <CTA
        headline="Ready to work with us?"
        subcopy="Let's discuss how Naveeg can help your business get online and grow."
        primaryButton={{
          text: "Contact us",
          href: "/contact",
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