import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Zap, LayoutDashboard, Shield, Database, TrendingUp, Headphones, CheckCircle, MessageSquare, Sparkles, Rocket } from 'lucide-react';
import TrustBadges from '@/components/TrustBadges';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { HeroAnimation } from '@/components/HeroAnimation';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { FloatingElements } from '@/components/FloatingElements';

const Home: React.FC = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const { updateBasicInfo } = useOnboardingStore();
  const [businessInput, setBusinessInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessInput.trim()) {
      // Fix: Set business_name instead of business_description
      updateBasicInfo({ 
        business_name: businessInput.trim(),
        business_description: businessInput.trim() 
      });
      navigate({ to: '/onboarding/brief' });
    }
  };

  const handleStartOnboarding = () => {
    navigate({ to: '/onboarding/brief' });
  };

  const iconMap = {
    zap: Zap,
    layout: LayoutDashboard,
    shield: Shield,
    database: Database,
    'trending-up': TrendingUp,
    headphones: Headphones
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
        <HeroAnimation />
        
        {/* Main Hero Content - Centered */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-sansation text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight animate-fade-in-up">
                {t('hero.title')}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {t('hero.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Button
                  size="lg"
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl touch-target text-base animate-pulse-glow"
                  onClick={handleStartOnboarding}
                >
                  Create Your Website
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-12 px-8 rounded-xl touch-target text-base hover:scale-105 transition-transform duration-200"
                  onClick={() => navigate({ to: '/gallery' })}
                >
                  {t('hero.secondaryButton')}
                </Button>
              </div>
              
              <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <TrustBadges className="mb-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-sansation text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                {t('howItWorks.title')}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>
          </ScrollReveal>
          
          {/* Modern Background with Flow */}
          <div className="relative max-w-6xl mx-auto">
            {/* Desktop Flow Path */}
            <div className="hidden lg:block absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <path
                  d="M100 100 Q400 50 700 100"
                  stroke="url(#flowGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="opacity-30"
                />
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Tablet/Mobile Flow Path */}
            <div className="lg:hidden absolute left-1/2 top-0 bottom-0 w-px">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-muted-foreground/30 to-transparent"></div>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
              {[
                { icon: "MessageSquare", step: "01" },
                { icon: "Sparkles", step: "02" },
                { icon: "Rocket", step: "03" }
              ].map((step, index) => (
                <ScrollReveal key={index} delay={index * 200} direction="up">
                  <div className="relative text-center group">
                    {/* Background Card */}
                    <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-muted/30 rounded-3xl blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Main Content */}
                    <div className="relative bg-muted border border-border/50 rounded-3xl p-8 hover:border-muted-foreground/30 transition-all duration-300 hover:shadow-xl hover:shadow-muted-foreground/10">
                      {/* Step Indicator */}
                      <div className="absolute -top-4 left-6 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                        {step.step}
                      </div>

                      {/* Clean Icon */}
                      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 flex items-center justify-center">
                        {step.icon === "MessageSquare" && <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />}
                        {step.icon === "Sparkles" && <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />}
                        {step.icon === "Rocket" && <Rocket className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />}
                      </div>
                      
                      <h3 className="font-sansation font-semibold text-xl md:text-2xl text-foreground mb-4">
                        {t(`howItWorks.steps.${index}.title`)}
                      </h3>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                        {t(`howItWorks.steps.${index}.description`)}
                      </p>
                    </div>

                    {/* Connection Arrow (Desktop Only) */}
                    {index < 2 && (
                      <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-6 h-6 text-muted-foreground/60" />
                      </div>
                    )}

                    {/* Connection Arrow (Mobile/Tablet) */}
                    {index < 2 && (
                      <div className="lg:hidden absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                        <ArrowRight className="w-6 h-6 text-muted-foreground/60 rotate-90" />
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Naveeg */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-sansation text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                {t('whyNaveeg.title')}
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[0, 1, 2].map((index) => (
              <ScrollReveal key={index} delay={index * 200} direction="scale">
                <div className="relative group">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110"></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-card/90 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:border-muted-foreground/30 transition-all duration-300 hover:shadow-2xl hover:shadow-muted-foreground/10 group-hover:scale-105">
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="font-sansation font-semibold text-xl md:text-2xl text-foreground mb-4">
                        {t(`whyNaveeg.blocks.${index}.title`)}
                      </h3>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                        {t(`whyNaveeg.blocks.${index}.description`)}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Everything You Need to Succeed Online */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-sansation text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Everything You Need to Succeed Online
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const iconName = t(`features.cards.${index}.icon`) as keyof typeof iconMap;
              const IconComponent = iconMap[iconName] || Zap;
              
              return (
                <ScrollReveal 
                  key={index} 
                  delay={index * 100} 
                  direction={index % 2 === 0 ? 'left' : 'right'}
                >
                  <div className="group p-8 rounded-3xl bg-card border shadow-soft hover:shadow-medium hover:scale-105 hover:border-muted-foreground/30 transition-all duration-500 h-full">
                    <div className="w-16 h-16 flex items-center justify-center mb-6">
                      <IconComponent className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-sansation font-semibold text-xl md:text-2xl text-foreground mb-4">
                      {t(`features.cards.${index}.title`)}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {t(`features.cards.${index}.description`)}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Quote Block */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto text-center">
              <div className="relative">
                <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium text-primary-foreground mb-12 font-sansation leading-relaxed relative z-10">
                  If you can send an email, you can build your website with Naveeg
                </blockquote>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button 
                    variant="secondary"
                    size="lg" 
                    className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={handleStartOnboarding}
                  >
                    Try for Free
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-6 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                    onClick={() => navigate({ to: '/gallery' })}
                  >
                    See Live Demo
                  </Button>
                </div>
                
                <p className="text-sm text-primary-foreground/80">
                  7 days free - no credit card required
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. Built with Naveeg */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-sansation text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Built with Naveeg
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {t('gallery.subtitle')}
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: 6 }, (_, index) => (
              <ScrollReveal 
                key={index} 
                delay={index * 100} 
                direction={index % 2 === 0 ? 'left' : 'right'}
              >
                <div className="group cursor-pointer hover:scale-105 transition-transform duration-300">
                  <div className="aspect-video bg-muted rounded-3xl mb-6 relative overflow-hidden shadow-soft group-hover:shadow-medium transition-shadow duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-muted-foreground text-lg font-medium">Website Preview</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground text-xl mb-2">Sample Website {index + 1}</h3>
                  <p className="text-muted-foreground">Category name</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          
          <ScrollReveal delay={600}>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="text-sm md:text-base px-6 h-11" onClick={() => navigate({ to: '/gallery' })}>
                View All Examples
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* Testimonial Carousel */}
      <TestimonialCarousel />

      {/* 8. Pricing */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-sansation text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                {t('pricing.title')}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {t('pricing.subtitle')}
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[0, 1, 2].map((index) => {
              const plan = t(`pricing.plans.${index}`, { returnObjects: true }) as any;
              return (
                <ScrollReveal key={index} delay={index * 150} direction="scale">
                  <div
                    className={`group p-8 md:p-10 rounded-3xl border shadow-soft hover:shadow-xl hover:scale-105 transition-all duration-500 relative h-full ${
                      plan.popular ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'bg-card hover:border-muted-foreground/30'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-8">
                      <h3 className="font-sansation font-semibold text-2xl text-foreground mb-4">
                        {plan.name}
                      </h3>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-5xl md:text-6xl font-bold text-foreground">{plan.currency}{plan.price}</span>
                        <span className="text-muted-foreground ml-2 text-lg">{plan.period}</span>
                      </div>
                      <p className="text-muted-foreground text-lg">{plan.description}</p>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {plan.features?.map((feature: string, fIndex: number) => (
                        <li key={fIndex} className="flex items-start">
                          <CheckCircle className="h-6 w-6 text-muted-foreground mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-xl hover:scale-105 transition-transform duration-200"
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
          
          <ScrollReveal delay={600}>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="text-sm md:text-base px-6 h-11" onClick={() => navigate({ to: '/pricing' })}>
                {t('pricing.viewAll')}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-sansation text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                {t('faq.title')}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {t('faq.subtitle')}
              </p>
            </div>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {[0, 1, 2].map((index) => (
              <ScrollReveal key={index} delay={index * 150} direction="up">
                <div className="p-8 rounded-3xl bg-card border shadow-soft hover:shadow-medium hover:border-muted-foreground/30 transition-all duration-300 group">
                  <h3 className="font-semibold text-foreground text-xl md:text-2xl mb-4">
                    {t(`faq.questions.${index}.question`)}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {t(`faq.questions.${index}.answer`)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          
          <ScrollReveal delay={600}>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="text-sm md:text-base px-6 h-11" onClick={() => navigate({ to: '/faq' })}>
                {t('faq.viewAll')}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="scale">
            <div className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl overflow-hidden relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
              
              <div className="relative z-10">
                <h2 className="font-sansation text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                  Ready to Build Your Dream Website?
                </h2>
                <p className="text-lg md:text-xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of businesses who've transformed their online presence with Naveeg. Start building today!
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/95 font-semibold px-10 h-14 text-lg rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
                  onClick={handleStartOnboarding}
                >
                  Start Building Now
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                <p className="text-sm md:text-base mt-6 opacity-80">
                  No credit card required • Launch in minutes
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;