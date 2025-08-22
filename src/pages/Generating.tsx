import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

async function finalizeSite(website_id: number) {
  const end = Date.now() + 180_000;
  while (Date.now() < end) {
    try {
      const r = await api.publishAndFront(website_id);
      if (r?.ok) return r;
    } catch (e: any) {
      if (!['NO_PAGES_YET', 'PUBLISH_RETRY'].includes(e?.code) && ![409, 504].includes(e?.status)) throw e;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Publishing is taking longer than expected. Try again.');
}

export default function Generating() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { 
    website_id, 
    unique_id, 
    colors, 
    fonts, 
    pages_meta, 
    seo_title, 
    seo_description, 
    seo_keyphrase,
    business_name,
    business_description 
  } = useOnboardingStore();

  const steps = [
    'Create website',
    'Generate sitemap', 
    'Apply design',
    'Generate pages',
    'Publish pages',
    'Set front page',
    'Get preview link'
  ];
  
  const pct = Math.round((step / (steps.length - 1)) * 100);

  const generateWebsite = async () => {
    try {
      setError(null);
      setStep(0);

      // Skip create and sitemap - already done
      setStep(2);
      
      // Apply design
      const design = {
        colors,
        fonts,
        pages_meta,
        seo: {
          title: seo_title,
          description: seo_description,
          keyphrase: seo_keyphrase
        }
      };
      
      await api.updateDesign(website_id, design);
      setStep(3);

      // Generate from sitemap
      const params = {
        business_name,
        business_description,
        business_type: 'basic'
      };
      
      await api.generateFrom(website_id, unique_id, params);
      setStep(4);

      // Finalize (publish + front page + URLs)
      setStep(5);
      const { preview_url, admin_url } = await finalizeSite(website_id);
      setStep(6);

      // Navigate to ready page with URLs
      toast({
        title: 'Website generated successfully!',
        description: 'Your website is ready to view.',
      });

      // Store URLs in the onboarding store and navigate to ready
      useOnboardingStore.setState({ 
        preview_url, 
        admin_url 
      });
      
      navigate({ to: '/ready' });

    } catch (e: any) {
      console.error('Generation error:', e);
      setError(e?.message || 'Website generation failed. Please try again.');
    }
  };

  useEffect(() => {
    if (!website_id || !unique_id) {
      navigate({ to: '/brief' });
      return;
    }
    generateWebsite();
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await generateWebsite();
    setIsRetrying(false);
  };

  const handleGoBack = () => {
    navigate({ to: '/design' });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Generation Failed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{error}</p>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex-1"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      'Try Again'
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleGoBack}
                    disabled={isRetrying}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Design
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Generating your website</CardTitle>
              <p className="text-muted-foreground">
                This process may take a few minutes. Please don't close this page.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Step {step + 1} of {steps.length}
                  </span>
                  <span className="text-sm font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-sm mt-2 font-medium">
                  {steps[step]}
                </p>
              </div>

              <div className="space-y-2">
                {steps.map((stepName, i) => (
                  <div 
                    key={stepName} 
                    className={`flex items-center text-sm ${
                      i < step ? 'text-foreground' : 
                      i === step ? 'text-primary font-medium' : 
                      'text-muted-foreground'
                    }`}
                  >
                    <span className="mr-3 w-6">
                      {i < step ? '✓' : i === step ? '•' : '○'}
                    </span>
                    {stepName}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Did you know?</strong> Your website is being generated using AI that analyzes 
                  your business description to create custom content, layout, and design that matches 
                  your brand perfectly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}