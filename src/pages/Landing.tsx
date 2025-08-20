import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Landing: React.FC = () => {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [businessInput, setBusinessInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessInput.trim()) {
      // Prefill the business description
      dispatch({
        type: 'UPDATE_BRIEF',
        payload: { businessDescription: businessInput.trim() }
      });
      
      navigate({ to: '/describe' });
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get your website ready in just 30 seconds'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Smart design that matches your business'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Built-in security and performance optimization'
    },
    {
      icon: Globe,
      title: 'Mobile-First',
      description: 'Perfect on every device and screen size'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Badge */}
          <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground mb-6 animate-in">
            <Sparkles className="mr-2 h-4 w-4" />
            No coding required • 100% customizable
          </div>

          {/* Hero Title */}
          <h1 className="font-syne text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-slide-up">
            {t('heroTitle')}
          </h1>

          {/* Hero Subtitle */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up">
            {t('heroSubtitle')}
          </p>

          {/* Hero Form */}
          <div className="max-w-2xl mx-auto mb-16 animate-slide-up">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder={t('businessPlaceholder')}
                value={businessInput}
                onChange={(e) => setBusinessInput(e.target.value)}
                className="flex-1 h-12 px-6 text-lg rounded-2xl border-2 touch-target"
                required
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-gradient-primary hover:bg-primary-hover text-white font-semibold rounded-2xl touch-target"
                disabled={!businessInput.trim()}
              >
                {t('generateButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-card border shadow-soft hover:shadow-medium transition-all duration-300 animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-2xl mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-syne font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-3xl border shadow-soft p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">30s</div>
              <div className="text-muted-foreground">Average creation time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;