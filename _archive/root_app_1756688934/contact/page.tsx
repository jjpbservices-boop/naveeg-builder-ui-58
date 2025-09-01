'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function ContactPage() {
  const t = getTranslations('en');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Header t={t} />
        <div className="container-clean py-32 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="mb-6">{t.contact.success}</h1>
            <p className="text-lg text-[var(--muted)] mb-8">
              We'll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-black"
            >
              Send another message
            </button>
          </div>
        </div>
        <Footer t={t} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.contact.title}
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto">
            Tell us what you do and what you need. We'll reply fast.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="container-clean max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text)] mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="business" className="block text-sm font-medium text-[var(--text)] mb-2">
                Business name
              </label>
              <input
                type="text"
                id="business"
                name="business"
                value={formData.business}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[var(--text)] mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Tell us about your business and what you need..."
              />
            </div>

            <button type="submit" className="btn-black w-full">
              Send message
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[var(--muted)] mb-4">
              Or email us directly at:
            </p>
            <a 
              href="mailto:support@naveeg.app" 
              className="text-[var(--text)] font-medium hover:underline"
            >
              support@naveeg.app
            </a>
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
