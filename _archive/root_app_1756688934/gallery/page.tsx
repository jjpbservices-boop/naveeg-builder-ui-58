'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';

export default function GalleryPage() {
  const t = getTranslations('en');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const galleryItems = [
    { id: 1, title: "Restaurant", category: "Food & Beverage", image: "🍽️" },
    { id: 2, title: "Salon", category: "Beauty & Wellness", image: "💇‍♀️" },
    { id: 3, title: "Consulting", category: "Professional Services", image: "💼" },
    { id: 4, title: "Retail", category: "Shopping", image: "🛍️" },
    { id: 5, title: "Fitness", category: "Health & Fitness", image: "💪" },
    { id: 6, title: "Real Estate", category: "Property", image: "🏠" },
    { id: 7, title: "Dental", category: "Healthcare", image: "🦷" },
    { id: 8, title: "Law Firm", category: "Legal Services", image: "⚖️" },
    { id: 9, title: "Photography", category: "Creative", image: "📸" },
    { id: 10, title: "Auto Repair", category: "Automotive", image: "🔧" },
    { id: 11, title: "Bakery", category: "Food & Beverage", image: "🥖" },
    { id: 12, title: "Pet Grooming", category: "Pet Services", image: "🐕" },
  ];

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.gallery.title}
          </h1>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container-clean">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div 
                key={item.id} 
                className="card p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="w-full h-48 bg-[var(--wash-1)] rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">{item.image}</span>
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

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[var(--radius)] max-w-md w-full p-6">
            <div className="w-full h-64 bg-[var(--wash-1)] rounded-lg mb-4 flex items-center justify-center">
              <span className="text-8xl">{selectedItem.image}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[var(--text)]">
              {selectedItem.title}
            </h3>
            <p className="text-[var(--muted)] mb-4">
              {selectedItem.category}
            </p>
            <button
              onClick={() => setSelectedItem(null)}
              className="btn-black w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer t={t} />
    </div>
  );
}
