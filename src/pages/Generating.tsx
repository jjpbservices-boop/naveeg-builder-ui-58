import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { api, updateDesign } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { EnhancedLoading } from '@/components/EnhancedLoading';

const generationSteps = [
  { name: 'Creating website structure', description: 'Building the foundation of your website' },
  { name: 'Applying your design', description: 'Implementing your chosen colors and fonts' },
  { name: 'Generating content', description: 'Creating pages tailored to your business' },
  { name: 'Publishing website', description: 'Making your site live and accessible' },
  { name: 'Final optimizations', description: 'Adding finishing touches for performance' }
];

export default function Generating() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const {
    website_id, unique_id, colors, fonts, pages_meta,
    seo_title, seo_description, seo_keyphrase,
    business_name, business_description, business_type, website_type,
  } = useOnboardingStore();

  const generateWebsite = async () => {
    try {
      setError(null);
      
      // Simulate progress
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev < generationSteps.length - 1 ? prev + 1 : prev;
          setProgress(Math.min(((next + 1) / generationSteps.length) * 90, 90));
          return next;
        });
      }, 3000);

      // Save design
      await updateDesign(website_id, {
        colors, fonts, pages_meta,
        seo: { title: seo_title, description: seo_description, keyphrase: seo_keyphrase },
        website_type,
      });

      // Generate and publish
      const onboardingData = {
        business_name, business_description, business_type,
        seo_title, seo_description, seo_keyphrase,
        pages_meta, colors, fonts, website_type,
      };
      
      await api.generateFromWithPolling(website_id, unique_id, onboardingData);
      await api.publishAndFrontWithPolling(website_id);

      clearInterval(stepInterval);
      setProgress(100);
      
      toast({
        title: 'Website generated successfully!',
        description: 'Your website is ready for preview.'
      });

      setTimeout(() => navigate({ to: '/ready' }), 1000);

    } catch (error: any) {
      console.error('Generation error:', error);
      setError(error.message || 'Failed to generate website. Please try again.');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!website_id || !unique_id) {
      navigate({ to: '/brief' });
      return;
    }
    generateWebsite();
  }, []);

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    setIsGenerating(true);
    generateWebsite();
  };

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card/90 backdrop-blur-sm border shadow-soft rounded-lg p-6">
          <h2 className="text-xl font-bold text-destructive mb-4">Generation Failed</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button onClick={() => navigate({ to: '/design' })} variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <EnhancedLoading
        steps={generationSteps}
        currentStep={currentStep}
        title="Building Your Website"
        subtitle="Sit back and relax while we create your professional website"
        progress={progress}
        encouragementMessage="✨ Almost there! We're putting the finishing touches on your amazing website..."
      />
    );
  }

  return null;
}