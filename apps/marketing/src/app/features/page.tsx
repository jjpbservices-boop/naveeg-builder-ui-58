import { Section } from '../../components/Section'
import { FeatureCard } from '../../components/FeatureCard'
import { FinalCTA } from '../../components/sections/FinalCTA'
import Icon from '../../components/ui/Icon'

export default function Features() {
  const features = [
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
  ]

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">All the tools you need to grow online</h1>
          <p className="body max-w-2xl mx-auto">
            From AI-powered website creation to advanced marketing tools, Naveeg gives you everything needed to build a professional WordPress website that drives real business results.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, i) => (
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
      
      <FinalCTA />
    </div>
  )
}
