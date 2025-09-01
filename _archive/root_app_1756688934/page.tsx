import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function HomePage() {
  const t = getTranslations('en');

  const testimonials = [
    {
      quote: "Zero tech in our team. We went live the same day.",
      author: "Sample",
      role: "Café owner"
    },
    {
      quote: "We changed prices and photos ourselves. Easy.",
      author: "Sample",
      role: "Hair salon"
    },
    {
      quote: "Finally, a website I can actually manage.",
      author: "Sample",
      role: "Local shop"
    }
  ];

  const galleryItems = [
    { id: 1, title: "Restaurant", category: "Food & Beverage" },
    { id: 2, title: "Salon", category: "Beauty & Wellness" },
    { id: 3, title: "Consulting", category: "Professional Services" },
    { id: 4, title: "Retail", category: "Shopping" },
    { id: 5, title: "Fitness", category: "Health & Fitness" },
    { id: 6, title: "Real Estate", category: "Property" },
  ];

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="relative bg-[var(--wash-1)] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--accent-grad)] opacity-5"></div>
        <div className="relative container-clean py-32 text-center">
          <h1 className="text-balance mb-6">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>
          <a href="/start" className="btn-black text-lg px-8 py-4">
            {t.hero.cta}
          </a>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="section bg-white">
        <div className="container-clean">
          <div className="grid md:grid-cols-3 gap-8">
            {t.home.pillars.map((pillar: any, index: number) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[var(--accent-grad)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[var(--text)]">
                  {pillar.title}
                </h3>
                <p className="text-[var(--muted)]">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section bg-[var(--wash-2)]">
        <div className="container-clean">
          <h2 className="text-center mb-16">
            {t.home.galleryTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item) => (
              <div key={item.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="w-full h-48 bg-[var(--wash-1)] rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🏠</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {item.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white">
        <div className="container-clean">
          <h2 className="text-center mb-16">
            {t.home.testimonialsTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8 text-center">
                <div className="text-4xl mb-4">💬</div>
                <blockquote className="text-lg mb-6 text-[var(--text)]">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-[var(--text)]">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-20 bg-[var(--accent-grad)]">
        <div className="container-clean text-center">
          <h2 className="text-white mb-4">
            {t.home.ctaStripTitle}
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            {t.home.ctaStripSub}
          </p>
          <a href="/start" className="btn-black bg-white text-black hover:bg-gray-100">
            {t.hero.cta}
          </a>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
