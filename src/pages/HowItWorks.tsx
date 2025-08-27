import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowDown } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const { t } = useTranslation('howItWorks');
  const navigate = useNavigate();

  const steps = t('steps', { returnObjects: true }) as any[];
  const features = t('features.list', { returnObjects: true }) as string[];

  const handleStartTrial = () => {
    navigate({ to: '/onboarding/brief' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="font-sansation text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps Timeline */}
        <section className="mb-20">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-20 bg-border md:hidden" />
                )}
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
                }`}>
                  {/* Content */}
                  <div className={`${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4 shrink-0">
                        <span className="font-sansation text-xl font-bold text-white">
                          {step.number}
                        </span>
                      </div>
                      <h3 className="font-sansation text-2xl md:text-3xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-lg text-muted-foreground mb-4">
                      {step.description}
                    </p>
                    <p className="text-foreground">
                      {step.details}
                    </p>
                  </div>

                  {/* Visual/Screenshot placeholder */}
                  <div className={`${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    <div className="bg-card rounded-3xl border shadow-soft p-8 h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="font-sansation text-2xl font-bold text-primary">
                            {step.number}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          Screenshot of step {index + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow indicator for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex justify-center mt-12">
                    <ArrowDown className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features Included */}
        <section className="mb-16">
          <div className="bg-muted rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="font-sansation text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('features.title')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t('features.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-success shrink-0" />
                  <span className="text-foreground font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="font-sansation text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleStartTrial}
            className="bg-white text-primary hover:bg-white/90 font-semibold"
          >
            {t('cta.button')}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;