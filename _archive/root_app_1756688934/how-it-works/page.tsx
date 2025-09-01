import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function HowItWorksPage() {
  const t = getTranslations('en');

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.how.title}
          </h1>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container-clean">
          <div className="grid md:grid-cols-3 gap-12">
            {t.how.steps.map((step: any, index: number) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-[var(--accent-grad)] rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-white text-3xl font-bold">{step.n}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-[var(--text)]">
                  {step.title}
                </h3>
                <p className="text-lg text-[var(--muted)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--accent-grad)] py-20">
        <div className="container-clean text-center">
          <h2 className="text-white mb-6">
            Ready to start building?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Get your website up and running in minutes.
          </p>
          <a href="/start" className="btn-black bg-white text-black hover:bg-gray-100">
            {t.how.cta}
          </a>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
