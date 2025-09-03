'use client'

import { FadeIn } from '../ui/Motion'
import Icon from '../ui/Icon'

export function WhyDark() {
  const values = [
    {
      icon: <Icon name="search" className="w-6 h-6" />,
      title: "Be visible on Google",
      description: "SEO-ready pages help local customers find you.",
      color: "accent"
    },
    {
      icon: <Icon name="users" className="w-6 h-6" />,
      title: "Turn clicks into clients",
      description: "Smart layouts and lead capture forms convert visitors.",
      color: "accent"
    },
    {
      icon: <Icon name="trending-up" className="w-6 h-6" />,
      title: "Grow without limits",
      description: "From simple showcase sites to full e-commerce, your website scales with you.",
      color: "accent"
    }
  ]

  return (
    <section className="section-y section-dark text-white relative overflow-hidden">
      <div className="container-max relative z-10">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Why choose Naveeg?
          </h2>
          <p className="text-lg text-[var(--muted-light)] max-w-2xl mx-auto">
            Naveeg is more than a site builder. We give you a WordPress website that delivers real business results.
          </p>
        </FadeIn>
        
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <FadeIn key={i} delay={i * 0.1} className="text-center h-full">
              <div className="card-dark p-8 hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                <div className="icon-container icon-container-accent mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white min-h-[3rem] flex items-center justify-center">{value.title}</h3>
                <p className="text-[var(--muted-light)] leading-relaxed flex-grow flex items-start justify-center">{value.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
