import React from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircle } from 'lucide-react';

const FAQ: React.FC = () => {
  const { t } = useTranslation('faq');
  const navigate = useNavigate();

  const questions = Array.from({ length: 10 }, (_, i) => i);

  const handleStartOnboarding = () => {
    navigate({ to: '/onboarding' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="font-sansation text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('faq.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <p className="text-lg text-muted-foreground mb-6">
            {t('faq.cta.subtitle')}
          </p>
          <Button
            size="lg"
            onClick={handleStartOnboarding}
            className="bg-accent-foreground hover:bg-accent-foreground/90 text-accent font-semibold px-8 py-3 rounded-2xl"
          >
            {t('faq.cta.button')}
          </Button>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-16">
          <Accordion type="single" collapsible className="space-y-6">
            {questions.map((index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-2xl bg-card shadow-soft px-6"
              >
                <AccordionTrigger className="text-left font-sansation font-semibold text-lg py-6 hover:no-underline">
                  {t(`questions.${index}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {t(`questions.${index}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions section */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-card rounded-3xl border shadow-soft p-8 md:p-12">
            <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="font-sansation text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t('stillHaveQuestions.title')}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {t('stillHaveQuestions.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:bg-primary-hover text-white touch-target"
                onClick={() => navigate({ to: '/contact' })}
              >
                {t('stillHaveQuestions.contactSupport')}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="touch-target"
              >
                {t('stillHaveQuestions.browseHelp')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;