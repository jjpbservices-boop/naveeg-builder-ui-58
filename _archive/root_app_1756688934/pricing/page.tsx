'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function PricingPage() {
  const t = getTranslations('en');
  const [isYearly, setIsYearly] = useState(false);
  const [showVAT, setShowVAT] = useState(false);

  const getPlanPrice = (basePrice: number) => {
    if (isYearly) {
      return Math.round(basePrice * 10); // Save 2 months
    }
    return basePrice;
  };

  const getPlanPeriod = () => {
    return isYearly ? '/ year' : '/ month';
  };

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.pricing.title}
          </h1>
        </div>
      </section>

      {/* Toggle Section */}
      <section className="py-12 bg-white">
        <div className="container-clean">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Monthly/Yearly Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isYearly
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.pricing.toggle.monthly}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isYearly
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.pricing.toggle.yearly}
              </button>
            </div>

            {/* VAT Toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showVAT}
                onChange={(e) => setShowVAT(e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-[var(--muted)]">
                {t.pricing.toggle.vat}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container-clean">
          <div className="grid lg:grid-cols-3 gap-8">
            {t.pricing.plans.map((plan: any, index: number) => (
              <div key={plan.slug} className="card overflow-hidden">
                {/* Header Band */}
                <div 
                  className={`h-3 ${
                    plan.band === 'entry' ? 'bg-[var(--plan-entry)]' :
                    plan.band === 'grow' ? 'bg-[var(--plan-grow)]' :
                    'bg-[var(--plan-custom)]'
                  }`}
                />
                
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-2 text-[var(--text)]">
                    {plan.name}
                  </h3>
                  <p className="text-[var(--muted)] mb-6">
                    {plan.for}
                  </p>
                  
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-[var(--text)]">
                      {plan.slug === 'custom' ? plan.price : `${getPlanPrice(plan.slug === 'entry' ? 49 : 99)} €`}
                    </span>
                    {plan.slug !== 'custom' && (
                      <span className="text-lg text-[var(--muted)]">
                        {getPlanPeriod()}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-[var(--muted)]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.slug === 'custom' ? '/contact' : '/start'}
                    className="btn-black w-full justify-center"
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-[var(--wash-2)]">
        <div className="container-clean">
          <h2 className="text-center mb-16">
            {t.pricing.includesTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.pricing.includes.map((feature: string, index: number) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-[var(--accent-grad)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">✓</span>
                </div>
                <p className="text-[var(--muted)]">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
