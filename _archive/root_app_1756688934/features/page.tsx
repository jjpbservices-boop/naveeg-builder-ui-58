import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function FeaturesPage() {
  const t = getTranslations('en');

  const features = t.features.items;

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.features.title}
          </h1>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container-clean">
          {features.map((feature: any, index: number) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 mb-20 ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}>
              {/* Image/Icon */}
              <div className="lg:w-1/2">
                <div className="w-full h-80 bg-[var(--wash-1)] rounded-[var(--radius)] flex items-center justify-center">
                  <span className="text-8xl">
                    {index === 0 && '🤖'}
                    {index === 1 && '🚀'}
                    {index === 2 && '🎨'}
                    {index === 3 && '🌐'}
                    {index === 4 && '🔑'}
                    {index === 5 && '📊'}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="lg:w-1/2">
                <h3 className="text-2xl font-semibold mb-4 text-[var(--text)]">
                  {feature.name}
                </h3>
                <p className="text-lg text-[var(--muted)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--accent-grad)] py-20">
        <div className="container-clean text-center">
          <h2 className="text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Try Naveeg free and see how easy it is to build your website.
          </p>
          <a href="/start" className="btn-black bg-white text-black hover:bg-gray-100">
            Start free
          </a>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
