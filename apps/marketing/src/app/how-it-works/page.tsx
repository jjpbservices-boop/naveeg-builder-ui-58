import { Section } from '../../components/Section'
import { FadeIn, Stagger } from '../../components/ui/Motion'
import Icon from '../../components/ui/Icon'

export default function HowItWorks() {
  const steps = [
    {
      icon: <Icon name="bot" className="size-6 text-neutral-800" />,
      title: "Describe your business",
      description: "Tell us about your business, industry, and what you want to achieve online."
    },
    {
      icon: <Icon name="rocket" className="size-6 text-neutral-800" />,
      title: "AI generates your site",
      description: "Our AI creates a professional website with content, structure, and design tailored to your business."
    },
    {
      icon: <Icon name="building2" className="size-6 text-neutral-800" />,
      title: "Launch and grow",
      description: "Your website goes live instantly. Edit content, add pages, and grow your online presence."
    }
  ]

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">How it works</h1>
          <p className="body max-w-2xl mx-auto">
            From idea to live website in three simple steps
          </p>
        </div>
        
        <Stagger className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1} className="text-center">
              <div className="card p-8">
                <div className="size-16 rounded-full bg-indigo-100 grid place-items-center mx-auto mb-6">
                  {step.icon}
                </div>
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-sm font-bold">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-[var(--muted)]">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </Stagger>
        
        <div className="text-center mt-12">
          <a href="/start" className="btn-black">
            Start building now
          </a>
        </div>
      </Section>
    </div>
  )
}
