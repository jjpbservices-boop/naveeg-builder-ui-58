'use client'

import { HoverLift } from './ui/Motion'
import { PLANS, type PlanId } from '../data/pricing.config'

interface PricingCardProps {
  planId: PlanId
}

export function PricingCard({ planId }: PricingCardProps) {
  const plan = PLANS.find(p => p.id === planId)!
  const bandColor = {
    entry: "var(--band-entry)",
    grow: "var(--band-grow)",
    custom: "var(--band-custom)"
  }[plan.band]

  return (
    <HoverLift>
      <div className="card relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        {/* Header band */}
        <div 
          style={{ background: bandColor }} 
          className="h-14 rounded-t-[1.2rem]"
        />
        
        {/* Popular badge */}
        {plan.popular && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center h-8 px-3 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
              Most Popular
            </span>
          </div>
        )}
        
        <div className="p-8">
          <h3 className="text-xl font-bold mb-2 text-[var(--ink)]">{plan.name}</h3>
          
          {/* Plan description */}
          <p className="text-sm text-[var(--muted)] mb-4">{plan.description}</p>
          
          {/* Price or Contact Us */}
          <div className="mb-6">
            {plan.priceMonthly !== null ? (
              <>
                <span className="text-4xl font-bold text-[var(--ink)]">{plan.priceMonthly}</span>
                <span className="text-[var(--muted)] ml-1">{plan.currency} / month</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-[var(--ink)]">Contact Us</span>
            )}
          </div>
          
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <span className="text-sm text-[var(--muted)]">{feature}</span>
              </li>
            ))}
          </ul>
          
          <button className="btn-black w-full group-hover:bg-neutral-900 transition-colors">
            {plan.cta}
          </button>
        </div>
      </div>
    </HoverLift>
  )
}
