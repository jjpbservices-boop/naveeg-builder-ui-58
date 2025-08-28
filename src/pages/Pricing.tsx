import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const Pricing: React.FC = () => {
  const { t, i18n } = useTranslation('pricing');
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = ['starter', 'pro', 'custom'];

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const faqQuestions = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-sansation text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('subtitle')}
          </p>
          
          {/* Trial Banner */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-primary-light border border-primary/20 rounded-2xl p-4 text-center">
              <p className="text-primary font-medium text-sm">
                {t('freeTrial')} · Cancel anytime · VAT included
              </p>
            </div>
          </div>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {t('monthly')}
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <span className={isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {t('annually')}
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-primary-light text-primary">
                {t('save')}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((planKey, index) => {
            const plan = t(`plans.${planKey}`, { returnObjects: true }) as any;
            const price = isAnnual ? plan.price.annually : plan.price.monthly;
            
            return (
              <div
                key={planKey}
                className={`p-8 rounded-2xl border shadow-soft hover:shadow-medium transition-all duration-300 relative ${
                  plan.popular ? 'border-primary bg-primary-light scale-105' : 'bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {t('mostPopular')}
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="font-sansation font-bold text-2xl text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-foreground">
                        {typeof price === 'string' ? price : `€${price}`}
                      </span>
                      {typeof price !== 'string' && (
                        <span className="text-muted-foreground ml-2">/month TTC</span>
                      )}
                    </div>
                    {isAnnual && typeof price !== 'string' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Billed annually
                      </p>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features?.map((feature: string, fIndex: number) => (
                    <li key={fIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full touch-target"
                  variant={index === 2 ? 'outline' : 'default'}
                  size="lg"
                >
                  {index === 2 ? t('contactSales') : t('getStarted')}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {t('noCredit')}
                </p>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-sansation text-3xl md:text-4xl font-bold text-foreground text-center mb-8">
            {t('faq.title')}
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {Array.from({ length: 7 }, (_, i) => i).map((index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-2xl px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {t(`faq.questions.${index}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(`faq.questions.${index}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Enterprise Section */}
        <div className="bg-card rounded-3xl border shadow-soft p-8 md:p-12 text-center">
          <h2 className="font-sansation text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('enterprise.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('enterprise.subtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {['Custom pricing', 'Dedicated infrastructure', 'Advanced security', 'Priority support', 'Custom integrations'].map((feature, index) => (
              <div key={index} className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
          
          <Button size="lg" className="bg-gradient-primary hover:bg-primary-hover text-white">
            {t('enterprise.contact')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;