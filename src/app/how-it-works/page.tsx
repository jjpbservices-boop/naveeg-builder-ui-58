import { Section } from '../../components/Section'
import { FadeIn, Stagger } from '../../components/ui/Motion'
import Icon from '../../components/ui/Icon'

export default function HowItWorks() {
  const steps = [
    {
      icon: "bot",
      title: "Describe your business",
      description: "Answer a few simple questions about your business, industry, and goals. Our AI understands what makes you unique."
    },
    {
      icon: "rocket",
      title: "Preview and customize",
      description: "Review your AI-generated website and make any adjustments. Change text, images, colors, and layout with our simple editor."
    },
    {
      icon: "building2",
      title: "Go live instantly",
      description: "Publish your website with one click. We handle hosting, SSL certificates, and domain setup automatically."
    }
  ]

  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">How it works</h1>
          <p className="body max-w-2xl mx-auto">
            From idea to live website in three simple steps. No technical skills required.
          </p>
        </div>

        <Stagger className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="card p-8 text-center">
                <div className="size-16 rounded-full bg-indigo-100 grid place-items-center mx-auto mb-6">
                  <Icon name={step.icon as any} className="size-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[var(--ink)]">{step.title}</h3>
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
