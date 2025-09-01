import { Section } from '../../components/Section'
import { FeatureCard } from '../../components/FeatureCard'
import { FadeIn } from '../../components/ui/Motion'

export default function Features() {
  const features = [
    {
      icon: "bot",
      title: "AI Website Generation",
      description: "Our AI analyzes your business and creates a complete website structure in minutes. No more staring at blank pages.",
      details: ["Business analysis", "Content generation", "Structure optimization", "SEO basics"]
    },
    {
      icon: "server-cog",
      title: "Hosting + SSL + Backups",
      description: "Professional hosting with automatic SSL certificates and daily backups. Your site is always secure and available.",
      details: ["EU-based hosting", "Automatic SSL", "Daily backups", "99.9% uptime"]
    },
    {
      icon: "panels-top-left",
      title: "Drag-and-Drop Editor",
      description: "Edit your website with our intuitive drag-and-drop editor. No coding required, just click and customize.",
      details: ["Visual editing", "Component library", "Real-time preview", "Mobile responsive"]
    },
    {
      icon: "globe2",
      title: "Domain Connection",
      description: "Connect your custom domain with one click. Professional branding for your business starts here.",
      details: ["Custom domains", "DNS management", "Email forwarding", "Subdomain support"]
    },
    {
      icon: "key-round",
      title: "One-Click WP Auto-Login",
      description: "Access your WordPress admin panel instantly with our secure auto-login system. No more password hassles.",
      details: ["Secure access", "Admin panel", "User management", "Plugin control"]
    },
    {
      icon: "bar-chart-3",
      title: "Simple Analytics",
      description: "Track your website performance with built-in analytics. Understand your visitors and optimize accordingly.",
      details: ["Visitor tracking", "Page performance", "Traffic sources", "Conversion metrics"]
    }
  ]

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">Features</h1>
          <p className="body max-w-2xl mx-auto">
            Everything you need to build, launch, and grow your online presence. No technical skills required.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {features.map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <FeatureCard {...feature} />
            </FadeIn>
          ))}
        </div>
      </Section>
    </div>
  )
}
