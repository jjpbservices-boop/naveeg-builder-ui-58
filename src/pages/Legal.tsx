import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Legal: React.FC = () => {
  const { t, i18n } = useTranslation('legal');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const lastUpdated = new Date('2024-01-15');

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-syne text-4xl md:text-5xl font-bold text-foreground mb-6">
            Legal Information
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Important legal information and policies
          </p>
        </div>

        {/* Legal Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="terms" className="touch-target">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy" className="touch-target">Privacy Policy</TabsTrigger>
              <TabsTrigger value="cookies" className="touch-target">Cookie Policy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms">
              <div className="bg-card rounded-3xl border shadow-soft p-8 md:p-12">
                <h2 className="font-syne text-3xl font-bold text-foreground mb-4">
                  {t('terms.title')}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t('terms.lastUpdated', { date: formatDate(lastUpdated) })}
                </p>
                
                <div className="prose prose-gray max-w-none">
                  <div className="text-muted-foreground leading-relaxed">
                    <p className="mb-6">
                      {t('terms.content')}
                    </p>
                    
                    {/* Placeholder content */}
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h3>
                        <p>By accessing and using Naveeg's website builder service, you accept and agree to be bound by the terms and provision of this agreement.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">2. Service Description</h3>
                        <p>Naveeg provides an AI-powered website building platform that allows users to create professional websites without coding knowledge.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">3. User Responsibilities</h3>
                        <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">4. Intellectual Property</h3>
                        <p>The service and its original content, features, and functionality are and will remain the exclusive property of Naveeg and its licensors.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">5. Contact Information</h3>
                        <p>If you have any questions about these Terms of Service, please contact us at legal@naveeg.com.</p>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy">
              <div className="bg-card rounded-3xl border shadow-soft p-8 md:p-12">
                <h2 className="font-syne text-3xl font-bold text-foreground mb-4">
                  {t('privacy.title')}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t('privacy.lastUpdated', { date: formatDate(lastUpdated) })}
                </p>
                
                <div className="prose prose-gray max-w-none">
                  <div className="text-muted-foreground leading-relaxed">
                    <p className="mb-6">
                      {t('privacy.content')}
                    </p>
                    
                    {/* Placeholder content */}
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Information We Collect</h3>
                        <p>We collect information you provide directly to us, information we obtain automatically when you use our services, and information from third parties.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">How We Use Your Information</h3>
                        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Information Sharing</h3>
                        <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Data Security</h3>
                        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Your Rights</h3>
                        <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cookies">
              <div className="bg-card rounded-3xl border shadow-soft p-8 md:p-12">
                <h2 className="font-syne text-3xl font-bold text-foreground mb-4">
                  {t('cookies.title')}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t('cookies.lastUpdated', { date: formatDate(lastUpdated) })}
                </p>
                
                <div className="prose prose-gray max-w-none">
                  <div className="text-muted-foreground leading-relaxed">
                    <p className="mb-6">
                      {t('cookies.content')}
                    </p>
                    
                    {/* Placeholder content */}
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">What Are Cookies</h3>
                        <p>Cookies are small text files that are placed on your computer by websites that you visit. They are widely used to make websites work more efficiently.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">How We Use Cookies</h3>
                        <p>We use cookies to improve your browsing experience, analyze site traffic, personalize content, and remember your preferences.</p>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Types of Cookies We Use</h3>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Essential cookies: Required for the website to function properly</li>
                          <li>Analytics cookies: Help us understand how visitors interact with our website</li>
                          <li>Preference cookies: Remember your settings and preferences</li>
                        </ul>
                      </section>
                      
                      <section>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Managing Cookies</h3>
                        <p>You can control and manage cookies in your browser settings. Please note that disabling cookies may affect the functionality of our website.</p>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Legal;