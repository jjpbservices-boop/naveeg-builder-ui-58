import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Loader } from 'lucide-react';

const Generate: React.FC = () => {
  const { t } = useTranslation('progress');
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { key: 'creating', label: t('progress:steps.creating') },
    { key: 'sitemap', label: t('progress:steps.sitemap') },
    { key: 'designing', label: t('progress:steps.designing') },
    { key: 'navigation', label: t('progress:steps.navigation') },
    { key: 'optimizing', label: t('progress:steps.optimizing') },
    { key: 'speed', label: t('progress:steps.speed') },
    { key: 'finalizing', label: t('progress:steps.finalizing') },
  ];

  useEffect(() => {
    const totalSteps = steps.length;
    const stepDuration = 3000; // 3 seconds per step
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          clearInterval(interval);
          // Navigate to ready page after completion
          setTimeout(() => {
            navigate({ to: '/ready' });
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    // Update progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const targetProgress = ((currentStep + 1) / totalSteps) * 100;
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(prev + 2, targetProgress);
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [currentStep, navigate, steps.length]);

  const estimatedSeconds = (steps.length - currentStep) * 3;

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-card rounded-3xl border shadow-large p-8 animate-bounce-in text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
            <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('progress:title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('progress:subtitle')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-3 mb-4" />
            <div className="text-sm text-muted-foreground">
              {progress < 100 ? (
                t('progress:estimatedTime', { seconds: estimatedSeconds })
              ) : (
                t('progress:almostDone')
              )}
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className="flex items-center p-4 rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: index <= currentStep ? 'hsl(var(--primary-light))' : 'hsl(var(--muted))',
                }}
              >
                <div className="mr-4">
                  {index < currentStep ? (
                    <CheckCircle className="h-6 w-6 text-success" />
                  ) : index === currentStep ? (
                    <Loader className="h-6 w-6 text-primary animate-spin" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-left">
                  <div className={`font-medium ${
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </div>
                  {index === currentStep && (
                    <div className="text-sm text-muted-foreground mt-1">
                      In progress...
                    </div>
                  )}
                  {index < currentStep && (
                    <div className="text-sm text-success mt-1">
                      Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">
              💡 Your website is being crafted with care. We're setting up everything to ensure
              it loads fast and looks amazing on all devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;