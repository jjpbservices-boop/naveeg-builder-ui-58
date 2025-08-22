import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { apiClient } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Generate: React.FC = () => {
  const { t } = useTranslation(['progress', 'common']);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { 
    siteId,
    colors,
    fonts,
    pages_meta,
    website_type,
    updateApiData,
    setError,
    error
  } = useOnboardingStore();

  const steps = [
    t('progress:steps.creating'),
    t('progress:steps.sitemap'), 
    t('progress:steps.designing'),
    t('progress:steps.navigation'),
    t('progress:steps.optimizing'),
    t('progress:steps.speed'),
    t('progress:steps.finalizing'),
  ];

  useEffect(() => {
    if (!siteId) {
      navigate({ to: '/onboarding/brief' });
      return;
    }

    startGeneration();
  }, [siteId, navigate]);

  const startGeneration = async () => {
    setIsGenerating(true);
    setHasError(false);
    setError(undefined);

    try {
      // First, update the site with the latest design preferences
      await updateSiteWithDesignPreferences();
      
      // Start the generation process
      const { data, error: generateError } = await apiClient.generateFromSitemap(siteId!);
      
      if (generateError) {
        throw new Error(generateError.message || 'Failed to generate website');
      }
      
      updateApiData({ preview_url: data!.url });
      
      // Simulate progress through steps with realistic timing
      await simulateProgress();
      
      toast.success('Website generated successfully!');
      setTimeout(() => navigate({ to: '/ready' }), 1500);
      
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setError(errorMessage);
      setHasError(true);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSiteWithDesignPreferences = async () => {
    // Store design preferences in the global store
    // The API will pick these up when generating
    console.log('Updated design preferences:', {
      colors,
      fonts,
      pages_meta,
      website_type
    });
  };

  const simulateProgress = async () => {
    for (let step = 0; step < steps.length; step++) {
      setCurrentStep(step);
      setProgress(((step + 1) / steps.length) * 100);
      
      // Different timing for different steps
      const delay = step === 0 ? 1500 : step === steps.length - 1 ? 2000 : 1800;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setProgress(0);
    startGeneration();
  };

  const handleGoBack = () => {
    navigate({ to: '/onboarding/design' });
  };

  const estimatedSeconds = Math.max(0, (steps.length - currentStep) * 2);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-card rounded-3xl border shadow-soft p-8">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            
            <h1 className="font-syne text-2xl md:text-3xl font-bold text-foreground mb-4">
              Generation Failed
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {error || 'Something went wrong while generating your website. Please try again.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="touch-target rounded-2xl"
              >
                Go Back to Design
              </Button>
              <Button
                onClick={handleRetry}
                className="touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="animate-slide-up">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('progress:title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('progress:subtitle')}
          </p>

          <div className="bg-card rounded-3xl border shadow-soft p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            {/* Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  ) : index === currentStep ? (
                    <Loader className="h-5 w-5 text-primary flex-shrink-0 animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`${index <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Estimated Time */}
            {isGenerating && estimatedSeconds > 0 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('progress:estimatedTime', { seconds: estimatedSeconds })}
                </p>
              </div>
            )}

            {/* Almost Done Message */}
            {currentStep >= steps.length - 1 && isGenerating && (
              <div className="text-center mt-4">
                <p className="text-sm text-primary font-medium">
                  {t('progress:almostDone')}
                </p>
              </div>
            )}
          </div>

          {/* Fun Fact */}
          <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">
              <strong>Did you know?</strong> We're using AI to craft each page specifically 
              for your business, ensuring your website stands out from the crowd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;