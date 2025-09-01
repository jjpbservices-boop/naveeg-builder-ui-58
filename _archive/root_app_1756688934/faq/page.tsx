'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from '@/lib/i18n';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function FAQPage() {
  const t = getTranslations('en');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (groupId: string, itemIndex: number) => {
    const key = `${groupId}-${itemIndex}`;
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key);
    } else {
      newOpenItems.add(key);
    }
    
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen">
      <Header t={t} />
      
      {/* Hero Section */}
      <section className="bg-[var(--wash-1)] py-20">
        <div className="container-clean text-center">
          <h1 className="mb-6">
            {t.faq.title}
          </h1>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20">
        <div className="container-clean max-w-4xl">
          <div className="space-y-8">
            {t.faq.groups.map((group: any, groupIndex: number) => (
              <div key={groupIndex}>
                <h2 className="text-2xl font-semibold mb-6 text-[var(--text)]">
                  {group.name}
                </h2>
                <div className="space-y-4">
                  {group.items.map((item: any, itemIndex: number) => {
                    const key = `${groupIndex}-${itemIndex}`;
                    const isOpen = openItems.has(key);
                    
                    return (
                      <div key={itemIndex} className="card">
                        <button
                          onClick={() => toggleItem(groupIndex.toString(), itemIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-[var(--text)]">
                            {item.q}
                          </span>
                          <ChevronDownIcon 
                            className={`w-5 h-5 text-[var(--muted)] transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-[var(--muted)] leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
