import { Section } from '../../components/Section'
import { FadeIn, Stagger } from '../../components/ui/Motion'
import { FinalCTA } from '../../components/sections/FinalCTA'
import Icon from '../../components/ui/Icon'

export default function HowItWorks() {
  const steps = [
    {
      icon: <Icon name="edit" className="w-6 h-6 text-neutral-800" />,
      title: "Describe your business",
      description: "Just a few words about what you do and who you serve."
    },
    {
      icon: <Icon name="bot" className="w-6 h-6 text-neutral-800" />,
      title: "AI builds your WordPress site",
      description: "Pages, content, and design generated instantly with professional layouts."
    },
    {
      icon: <Icon name="panels-top-left" className="w-6 h-6 text-neutral-800" />,
      title: "Customize easily",
      description: "Edit text, photos, and layout with drag-and-drop simplicity."
    },
    {
      icon: <Icon name="rocket" className="w-6 h-6 text-neutral-800" />,
      title: "Publish instantly",
      description: "Hosting, SSL, backups, and SEO included - your site goes live immediately."
    }
  ]

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">How it works</h1>
          <p className="body max-w-2xl mx-auto">
            From idea to live website in four simple steps
          </p>
        </div>
        
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1} className="text-center">
              <div className="card p-8">
                <div className="icon-container icon-container-light mx-auto mb-6">
                  {step.icon}
                </div>
                <div className="w-8 h-8 bg-[var(--accent-purple)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-sm font-bold">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-[var(--muted)]">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </Stagger>
        
      </Section>
      
      <FinalCTA />
    </div>
  )
}
