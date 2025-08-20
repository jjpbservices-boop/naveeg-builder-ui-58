import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, ExternalLink, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Preview: React.FC = () => {
  const { t } = useTranslation(['preview', 'common']);
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const businessType = state.brief.businessType;
  const businessName = state.brief.businessName || 'Your Business';

  // Mock website content based on business type
  const getCtaButtons = () => {
    if (businessType === 'restaurant') {
      return [
        { text: t('preview:cta.restaurant.orderNow'), primary: true },
        { text: t('preview:cta.restaurant.viewMenu'), primary: false },
      ];
    }
    return [
      { text: t('preview:cta.general.contactUs'), primary: true },
      { text: t('preview:cta.general.getQuote'), primary: false },
    ];
  };

  const navigation = [
    { key: 'home', label: t('preview:navigation.home') },
    { key: 'about', label: t('preview:navigation.about') },
    businessType === 'restaurant' 
      ? { key: 'menu', label: t('preview:navigation.menu') }
      : { key: 'services', label: t('preview:navigation.services') },
    { key: 'gallery', label: t('preview:navigation.gallery') },
    { key: 'contact', label: t('preview:navigation.contact') },
  ];

  const ctaButtons = getCtaButtons();

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg">
              {t('preview:toolbar.title')}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-muted rounded-xl p-1">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="touch-target"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  {t('preview:toolbar.desktop')}
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="touch-target"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  {t('preview:toolbar.mobile')}
                </Button>
              </div>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                disabled
                className="touch-target opacity-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('preview:toolbar.openSite')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="touch-target opacity-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('preview:toolbar.openAdmin')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex justify-center p-8">
        <div
          className={`bg-white rounded-2xl shadow-large overflow-hidden transition-all duration-300 ${
            viewMode === 'desktop' ? 'w-full max-w-6xl' : 'w-[375px]'
          }`}
          style={{
            minHeight: viewMode === 'desktop' ? '800px' : '667px',
          }}
        >
          {/* Mock Website */}
          <div 
            className="h-full"
            style={{
              fontFamily: `var(--font-${state.design.bodyFont})`,
              backgroundColor: state.design.darkBackground ? '#1f2937' : '#ffffff',
              color: state.design.darkBackground ? '#f9fafb' : '#111827',
            }}
          >
            {/* Header */}
            <header className="border-b px-6 py-4">
              <nav className="flex items-center justify-between">
                <div 
                  className="font-bold text-xl"
                  style={{ 
                    fontFamily: `var(--font-${state.design.headingFont})`,
                    color: state.design.primaryColor 
                  }}
                >
                  {businessName}
                </div>
                <div className={`flex items-center space-x-6 ${viewMode === 'mobile' ? 'hidden' : ''}`}>
                  {navigation.map((item) => (
                    <a
                      key={item.key}
                      href="#"
                      className="text-sm font-medium hover:opacity-75 transition-opacity"
                      onClick={(e) => e.preventDefault()}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </nav>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-16 text-center">
              <h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ 
                  fontFamily: `var(--font-${state.design.headingFont})`,
                  color: state.design.primaryColor
                }}
              >
                {t('preview:placeholder.hero', { businessName })}
              </h1>
              <p className="text-xl text-opacity-80 mb-8 max-w-2xl mx-auto">
                {t('preview:placeholder.subtitle', { businessType: businessType || 'business' })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {ctaButtons.map((button, index) => (
                  <button
                    key={index}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all touch-target ${
                      button.primary
                        ? 'text-white shadow-medium hover:shadow-large'
                        : 'border-2 hover:bg-opacity-10'
                    }`}
                    style={{
                      backgroundColor: button.primary ? state.design.primaryColor : 'transparent',
                      borderColor: button.primary ? 'transparent' : state.design.primaryColor,
                      color: button.primary ? 'white' : state.design.primaryColor,
                    }}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            </section>

            {/* Content Sections */}
            <section className="px-6 py-16 bg-opacity-5" style={{ backgroundColor: state.design.primaryColor }}>
              <div className="max-w-4xl mx-auto">
                <h2 
                  className="text-3xl font-bold text-center mb-12"
                  style={{ 
                    fontFamily: `var(--font-${state.design.headingFont})`,
                    color: state.design.primaryColor
                  }}
                >
                  {t('preview:placeholder.features')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: state.design.primaryColor + '20' }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: state.design.primaryColor }}
                        />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Feature {item}</h3>
                      <p className="text-opacity-70">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t text-center">
              <p className="text-sm opacity-60">
                © 2024 {businessName}. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;