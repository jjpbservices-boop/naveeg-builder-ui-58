import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function AboutPage() {
  const t = getTranslations('en');

  const team = [
    { name: "Alex", role: "Founder & CEO", emoji: "👨‍💼" },
    { name: "Sarah", role: "Head of Product", emoji: "👩‍💻" },
    { name: "Mike", role: "Lead Developer", emoji: "👨‍💻" },
    { name: "Emma", role: "Customer Success", emoji: "👩‍💬" },
  ];

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.about.title}
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto">
            {t.about.desc}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container-clean max-w-4xl">
          <div className="text-center">
            <h2 className="mb-8">Our Story</h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed mb-8">
              We started Naveeg because we saw too many small businesses struggling with outdated, 
              expensive, or overly complex website solutions. Our founders came from the world of 
              enterprise software and knew there had to be a better way.
            </p>
            <p className="text-lg text-[var(--muted)] leading-relaxed">
              Today, we're a small but mighty team focused on one thing: making it incredibly easy 
              for non-technical business owners to get online and look professional.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[var(--wash-2)]">
        <div className="container-clean">
          <h2 className="text-center mb-16">Meet the Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-[var(--accent-grad)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">{member.emoji}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--text)]">
                  {member.name}
                </h3>
                <p className="text-[var(--muted)]">
                  {member.role}
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
