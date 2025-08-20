import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Describe: React.FC = () => {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [description, setDescription] = useState(state.brief.businessDescription);

  useEffect(() => {
    setDescription(state.brief.businessDescription);
  }, [state.brief.businessDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      dispatch({
        type: 'UPDATE_BRIEF',
        payload: { businessDescription: description.trim() }
      });
      
      navigate({ to: '/brief' });
    }
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('describeTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('describeSubtitle')}
          </p>
        </div>

        <div className="bg-card rounded-3xl border shadow-soft p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Textarea
                placeholder={t('describeTextarea')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] text-base resize-none rounded-2xl border-2 p-6"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="touch-target rounded-2xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('global.back', { ns: 'common' })}
              </Button>
              
              <Button
                type="submit"
                className="flex-1 touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
                disabled={!description.trim()}
              >
                {t('generateWebsiteButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 bg-muted rounded-2xl">
          <h3 className="font-semibold text-foreground mb-3">
            💡 Tips for better results:
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Include your business name and what you do</li>
            <li>• Mention your target audience or customers</li>
            <li>• Describe your key services or products</li>
            <li>• Add any special features or unique selling points</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Describe;