import { Section } from '../../components/Section'
import { FeatureCard } from '../../components/FeatureCard'
import Icon from '../../components/ui/Icon'

export default function Features() {
  const features = [
    {
      icon: <Icon name="bot" className="size-6 text-neutral-800" />,
      title: "AI website generation",
      description: "Tell us about your business and we'll create a professional website in minutes.",
      details: ["Smart content generation", "Professional layouts", "Industry-specific designs"]
    },
    {
      icon: <Icon name="rocket" className="size-6 text-neutral-800" />,
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
      icon: <Icon name="server-cog" className="size-6 text-neutral-800" />,
      title: "Domain connection",
      description: "Connect your custom domain with one click. Professional branding for your business.",
      details: ["Custom domains", "DNS management", "Email forwarding"]
    },
    {
      icon: <Icon name="globe2" className="size-6 text-neutral-800" />,
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
  ]

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">Features</h1>
          <p className="body max-w-2xl mx-auto">
            Everything you need to build, launch, and grow your online presence
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
    </div>
  )
}
