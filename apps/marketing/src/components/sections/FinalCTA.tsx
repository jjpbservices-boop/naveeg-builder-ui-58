'use client'

import Link from 'next/link'
import { FadeIn } from '../ui/Motion'

export default function FinalCTA() {
  return (
    <section className="section-y">
      <div className="container-max">
        <div 
          className="rounded-2xl p-10 md:p-14 text-white shadow-[0_30px_80px_rgba(10,12,16,.25)]"
          style={{ background: "var(--cta-grad)" }}
        >
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Get your website live today
          </h3>
          <p className="mt-3 opacity-90 max-w-[60ch]">
            Try it free. Cancel anytime.
          </p>
          <div className="mt-6">
            <a 
              href="/pricing" 
              className="btn-black bg-white text-black hover:bg-neutral-100"
            >
              Start Building Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
