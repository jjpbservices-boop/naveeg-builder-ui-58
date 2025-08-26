import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Zap, Smartphone, Search, Shield, Palette, LayoutDashboard, Star, Users, Clock, CheckCircle } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { HeroAnimation } from '@/components/HeroAnimation';

const Home: React.FC = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const { updateBasicInfo } = useOnboardingStore();
  const [businessInput, setBusinessInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessInput.trim()) {
      updateBasicInfo({ business_description: businessInput.trim() });
      navigate({ to: '/onboarding/brief' });
    }
  };

  const handleStartOnboarding = () => {
    navigate({ to: '/onboarding/brief' });
  };

  const iconMap = {
    zap: Zap,
    smartphone: Smartphone,
    search: Search,
    shield: Shield,
    palette: Palette,
    layout: LayoutDashboard
  };

  return (
    <div className="min-h-screen">
      {/* Full-Screen Hero Section with Animation */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
        <HeroAnimation />
        
        {/* Main Hero Content - Centered */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-syne text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                {t('hero.title')}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>
              
              <div className="max-w-2xl mx-auto mb-4">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder={t('hero.inputPlaceholder')}
                    value={businessInput}
                    onChange={(e) => setBusinessInput(e.target.value)}
                    className="flex-1 h-12 px-6 text-lg rounded-2xl border-2 touch-target"
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 px-8 bg-gradient-primary hover:bg-primary-hover text-white font-semibold rounded-2xl touch-target whitespace-nowrap"
                    disabled={!businessInput.trim()}
                  >
                    {t('hero.ctaButton')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {t('hero.helper')}
              </p>
            </div>
          </div>
        </div>

        {/* Trial Banner - Bottom of hero */}
        <div className="relative z-10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-primary-light/80 border border-primary/20 rounded-2xl p-6 text-center">
                <p className="text-primary font-medium">
                  {t('trialBanner.text')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof - Very bottom of hero */}
        <div className="relative z-10 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-6">{t('socialProof.title')}</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-8 w-24 bg-muted/80 rounded flex items-center justify-center text-xs backdrop-blur-sm">
                    Logo {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[0, 1, 2].map((index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">{index + 1}</span>
              </div>
              <h3 className="font-syne font-semibold text-xl text-foreground mb-2">
                {t(`howItWorks.steps.${index}.title`)}
              </h3>
              <p className="text-muted-foreground">
                {t(`howItWorks.steps.${index}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const iconName = t(`features.cards.${index}.icon`) as keyof typeof iconMap;
            const IconComponent = iconMap[iconName] || Zap;
            
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card border shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-syne font-semibold text-xl text-foreground mb-2">
                  {t(`features.cards.${index}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`features.cards.${index}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Naveeg */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('whyNaveeg.title')}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[0, 1, 2].map((index) => (
            <div key={index} className="text-center p-6">
              <h3 className="font-syne font-semibold text-xl text-foreground mb-4">
                {t(`whyNaveeg.blocks.${index}.title`)}
              </h3>
              <p className="text-muted-foreground">
                {t(`whyNaveeg.blocks.${index}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('pricing.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[0, 1, 2].map((index) => {
            const plan = t(`pricing.plans.${index}`, { returnObjects: true }) as any;
            return (
              <div
                key={index}
                className={`p-8 rounded-2xl border shadow-soft hover:shadow-medium transition-all duration-300 relative ${
                  plan.popular ? 'border-primary bg-primary-light' : 'bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-syne font-semibold text-xl text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold text-foreground">{plan.currency}{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features?.map((feature: string, fIndex: number) => (
                    <li key={fIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full touch-target ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:bg-primary-hover text-white' 
                      : 'bg-background border border-border hover:bg-muted'
                  }`}
                >
                  Get Started
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate({ to: '/pricing' })}>
            {t('pricing.viewAll')}
          </Button>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('gallery.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="aspect-video bg-muted rounded-2xl mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Website Preview</span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Sample Website {index + 1}</h3>
              <p className="text-sm text-muted-foreground">Category name</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate({ to: '/gallery' })}>
            {t('gallery.viewAll')}
          </Button>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('faq.subtitle')}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="p-6 rounded-2xl bg-card border shadow-soft">
              <h3 className="font-semibold text-foreground mb-2">
                {t(`faq.questions.${index}.question`)}
              </h3>
              <p className="text-muted-foreground">
                {t(`faq.questions.${index}.answer`)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate({ to: '/faq' })}>
            {t('faq.viewAll')}
          </Button>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="font-syne text-3xl md:text-4xl font-bold mb-4">
            {t('ctaBanner.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('ctaBanner.subtitle')}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 touch-target"
            onClick={handleStartOnboarding}
          >
            {t('ctaBanner.button')}
          </Button>
          <p className="text-sm mt-4 opacity-75">
            {t('ctaBanner.helper')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;