'use client'

import { FadeIn } from '../ui/Motion'
import Icon from '../ui/Icon'

export function WhyDark() {
  const values = [
    {
      icon: <Icon name="rocket" className="size-6 text-neutral-300" />,
      title: "Easy start",
      description: "Answer a few questions. We set up everything for you."
    },
    {
      icon: <Icon name="bot" className="size-6 text-neutral-300" />,
      title: "Built by AI",
      description: "Pages and structure generated in minutes."
    },
    {
      icon: <Icon name="trending-up" className="size-6 text-neutral-300" />,
      title: "Ready to grow",
      description: "Edit with a simple editor and add pages anytime."
    }
  ]

  return (
    <section className="section-y bg-[#0b0d10] text-white">
      <div className="container-max">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Why choose Naveeg?
          </h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Three simple steps to your professional website
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <FadeIn key={i} delay={i * 0.1} className="text-center">
              <div className="p-6">
                <div className="size-11 rounded-full bg-neutral-800 grid place-items-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{value.title}</h3>
                <p className="opacity-80">{value.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
