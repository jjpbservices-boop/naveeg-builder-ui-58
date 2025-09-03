'use client'

import Link from 'next/link'
import { FadeIn } from '../ui/Motion'
import { HeroMock } from '../HeroMock'

export function Hero() {
  return (
    <section className="section-y section-light relative overflow-hidden">
      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <FadeIn className="text-center lg:text-left">
            <div className="kicker mb-4">AI-powered WordPress website builder for small businesses</div>
            <h1 className="h1 mb-6">Launch Your WordPress Website Easily & Quickly</h1>
            <p className="body mb-8 max-w-2xl mx-auto lg:mx-0">
              A real WordPress website that attracts customers, ranks on Google, and grows with your business. No technical skills required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-start">
              <div className="flex flex-col items-center sm:items-start">
                <Link href="/start" className="btn-primary btn-primary-light w-full sm:w-auto min-w-[200px]">
                  Start Free
                </Link>
                <p className="text-sm text-[var(--muted)] mt-2">7 days free - no credit card</p>
              </div>
              <div className="flex items-center">
                <Link href="/gallery" className="btn-secondary btn-secondary-light">
                  See Examples
                </Link>
              </div>
            </div>
          </FadeIn>
          
          <div className="hidden lg:block">
            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-2xl blur-3xl"></div>
                <HeroMock />
              </div>
            </FadeIn>
          </div>
        </div>
        
        {/* Logo cloud */}
        <FadeIn delay={0.4}>
          <div className="card p-8 bg-white/80 backdrop-blur-sm border-white/20">
            <div className="text-center mb-6">
              <p className="text-sm text-[var(--muted)]">Trusted by businesses worldwide</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center h-22">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="w-20 h-8 bg-gradient-to-r from-gray-200/60 to-gray-300/60 rounded opacity-60"></div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
