'use client'

import Link from 'next/link'
import { FadeIn } from '../ui/Motion'

export function FinalCTA() {
  return (
    <section className="section-y section-light relative overflow-hidden">
      <div className="container-max relative z-10">
        <FadeIn>
          <div 
            className="rounded-2xl p-10 md:p-14 text-white shadow-[0_30px_80px_rgba(10,12,16,.25)] relative overflow-hidden"
            style={{ background: "var(--primary-gradient)" }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Get your website live today
              </h3>
              <p className="mt-3 opacity-90 max-w-[60ch] text-lg">
                Start free, no credit card required. Cancel anytime.
              </p>
              <div className="mt-8">
                <Link 
                  href="/start" 
                  className="btn-primary btn-primary-dark"
                >
                  Start Building Now
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
