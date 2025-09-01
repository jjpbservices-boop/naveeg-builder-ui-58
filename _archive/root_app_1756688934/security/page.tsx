import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function SecurityPage() {
  const t = getTranslations('en');

  const securityFeatures = [
    "EU/EEA data hosting",
    "SSL encryption everywhere",
    "Daily automated backups",
    "Access controls & permissions",
    "Data export on request",
    "GDPR compliance",
    "Regular security audits",
    "24/7 monitoring"
  ];

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.security.title}
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto">
            {t.security.desc}
          </p>
        </div>
      </section>

      {/* Security Details */}
      <section className="py-20 bg-white">
        <div className="container-clean">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-[var(--text)]">
                Data Protection
              </h2>
              <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
                Your business data is precious. We protect it with enterprise-grade security 
                measures that meet EU standards and go beyond basic requirements.
              </p>
              <p className="text-lg text-[var(--muted)] leading-relaxed">
                All data is encrypted in transit and at rest, with regular backups stored 
                securely in multiple locations. We never share your data with third parties 
                without explicit consent.
              </p>
            </div>

            {/* Right Column */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-[var(--text)]">
                Compliance & Standards
              </h2>
              <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
                We're built for European businesses, which means we follow strict EU data 
                protection regulations and maintain the highest security standards.
              </p>
              <p className="text-lg text-[var(--muted)] leading-relaxed">
                Our infrastructure is regularly audited by independent security experts, 
                and we maintain certifications that demonstrate our commitment to security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Checklist */}
      <section className="py-20 bg-[var(--wash-2)]">
        <div className="container-clean">
          <h2 className="text-center mb-16">Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-[var(--text)] font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--accent-grad)]">
        <div className="container-clean text-center">
          <h2 className="text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Build your website with confidence knowing your data is secure.
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
