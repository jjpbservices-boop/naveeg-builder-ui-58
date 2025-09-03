import { Section } from '../../components/Section'
import { PricingCard } from '../../components/PricingCard'
import { FadeIn } from '../../components/ui/Motion'
import Link from 'next/link'

export default function Pricing() {
  return (
    <div>
      <section className="section-y section-light relative overflow-hidden">
        <div className="container-max relative z-10">
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
                  <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-[var(--muted)]">{feature}</span>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>
        
        {/* COMPETITOR COMPARISON - Dark */}
        <section className="section-y section-dark text-white relative overflow-hidden">
          <div className="container-max relative z-10">
            <FadeIn className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                How Naveeg compares to others
              </h2>
              <p className="text-lg text-[var(--muted-light)] max-w-2xl mx-auto">
                See why Naveeg is the smart choice for small businesses who want a real WordPress website
              </p>
            </FadeIn>
          
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[var(--border-light)] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[var(--surface-dark)]">
                    <th className="border border-[var(--border-light)] p-4 text-left font-semibold text-white">Feature</th>
                    <th className="border border-[var(--border-light)] p-4 text-center font-semibold text-white bg-gradient-to-r from-indigo-500/20 to-blue-500/20">Naveeg</th>
                    <th className="border border-[var(--border-light)] p-4 text-center font-semibold text-white">Wix</th>
                    <th className="border border-[var(--border-light)] p-4 text-center font-semibold text-white">Shopify</th>
                    <th className="border border-[var(--border-light)] p-4 text-center font-semibold text-white">Squarespace</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Real WordPress website", naveeg: "✔", wix: "✘", shopify: "✘", squarespace: "✘" },
                    { feature: "SEO optimization included", naveeg: "✔ Full", wix: "Partial", shopify: "Partial", squarespace: "Partial" },
                    { feature: "Built-in analytics dashboard", naveeg: "✔ Simple & clear", wix: "Basic", shopify: "Advanced (complex)", squarespace: "Basic" },
                    { feature: "Marketing automations", naveeg: "✔ Included", wix: "✘", shopify: "Limited apps", squarespace: "✘" },
                    { feature: "Lead generation tools", naveeg: "✔ Forms & CTAs", wix: "Limited", shopify: "Limited", squarespace: "Limited" },
                    { feature: "E-commerce ready", naveeg: "✔ WooCommerce", wix: "Limited", shopify: "✔ Full", squarespace: "Limited" },
                    { feature: "GDPR-compliant EU hosting", naveeg: "✔", wix: "✘", shopify: "✘", squarespace: "✘" },
                    { feature: "Cancel anytime", naveeg: "✔", wix: "✔", shopify: "✘ (monthly fee)", squarespace: "✔" },
                    { feature: "Free trial, no credit card", naveeg: "✔ 7 days", wix: "✘", shopify: "✘", squarespace: "✘" }
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-[var(--surface-dark)]" : "bg-[var(--wash-dark-2)]"}>
                      <td className="border border-[var(--border-light)] p-4 font-medium text-white">{row.feature}</td>
                      <td className="border border-[var(--border-light)] p-4 text-center bg-gradient-to-r from-indigo-500/20 to-blue-500/20 font-semibold text-indigo-300">{row.naveeg}</td>
                      <td className="border border-[var(--border-light)] p-4 text-center text-[var(--muted-light)]">{row.wix}</td>
                      <td className="border border-[var(--border-light)] p-4 text-center text-[var(--muted-light)]">{row.shopify}</td>
                      <td className="border border-[var(--border-light)] p-4 text-center text-[var(--muted-light)]">{row.squarespace}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-center mt-8">
              <Link href="/start" className="btn-primary btn-primary-light">
                Start Free Trial – 7 days, no credit card
              </Link>
            </div>
          </div>
        </section>
    </div>
  )
}
