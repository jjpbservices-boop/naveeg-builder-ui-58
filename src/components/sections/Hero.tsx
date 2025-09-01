'use client'

import { FadeIn } from '../ui/Motion'
import { HeroMock } from '../HeroMock'
import Icon from '../ui/Icon'

export function Hero() {
  return (
    <section className="section-y bg-[var(--wash-1)] relative overflow-hidden">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <FadeIn>
              <div className="kicker mb-4">Made for small businesses</div>
              <h1 className="h1 mb-6">
                Rome wasn't built in a day… but your website will be
              </h1>
              <p className="body mb-8 max-w-2xl mx-auto lg:mx-0">
                Launch a professional website in minutes. No tech skills needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a className="btn-black" href="/start">
                  Start free
                </a>
                <a 
                  className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-[var(--border)] text-[var(--ink)] hover:bg-gray-50 transition font-medium" 
                  href="/gallery"
                >
                  See examples
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right side - Mock */}
          <div className="hidden lg:block">
            <FadeIn>
              <HeroMock />
            </FadeIn>
          </div>
        </div>

        {/* Trust bar */}
        <div>
          <FadeIn>
            <div className="card p-8">
              <div className="text-center mb-6">
                <p className="text-sm text-[var(--muted)]">Trusted by businesses worldwide</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center h-22">
                {/* Logo placeholders */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <div className="w-20 h-8 bg-gray-200/60 rounded opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
