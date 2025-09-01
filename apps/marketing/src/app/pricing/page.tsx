import { Section } from '../../components/Section'
import { PricingCard } from '../../components/PricingCard'
import { FadeIn } from '../../components/ui/Motion'

export default function Pricing() {
  return (
    <div>
      <Section variant="light">
        <div className="text-center mb-16">
          <h1 className="h1 mb-6">Pricing</h1>
          <p className="body max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include our core features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard planId="starter" />
          <PricingCard planId="pro" />
          <PricingCard planId="custom" />
        </div>
        
        {/* What every plan includes */}
        <div className="mt-16">
          <FadeIn className="text-center mb-12">
            <h2 className="h2 mb-4">What every plan includes</h2>
            <p className="body max-w-2xl mx-auto">
              All plans come with our core features to help you succeed online
            </p>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Fast EU hosting with SSL",
              "Automatic daily backups",
              "Simple drag-and-drop editor",
              "Basic analytics and insights",
              "Email support during business hours",
              "Mobile-responsive design"
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 0.1} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-[var(--muted)]">{feature}</span>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
