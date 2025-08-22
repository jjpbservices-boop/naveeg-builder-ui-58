import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ArrowLeft, Check, Loader, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const briefSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessDescription: z.string().min(10, 'Please provide a more detailed description'),
});

type BriefFormData = z.infer<typeof briefSchema>;

const Brief: React.FC = () => {
  const { t } = useTranslation(['onboarding', 'common']);
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const {
    business_name,
    business_description,
    seo_title,
    seo_description,
    seo_keyphrase,
    website_id,
    unique_id,
    pages_meta,
    website_type,
    colors,
    fonts,
    updateBasicInfo,
    updateSEO,
    updateApiData,
    updatePages,
    updateWebsiteType,
    updateDesign,
    setError,
  } = useOnboardingStore();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      businessName: business_name,
      businessDescription: business_description,
    },
  });

  const handleAnalyze = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    setIsAnalyzing(true);
    setProgress(0);
    setError(undefined);

    try {
      console.log('Starting analysis with form data:', formData);
      
      // Test health check first
      console.log('Testing API health check...');
      const { data: healthData, error: healthError } = await apiClient.healthCheck();
      
      if (healthError) {
        console.error('Health check failed:', healthError);
        throw new Error(`API health check failed: ${healthError.message}`);
      }
      
      console.log('Health check passed:', healthData);
      
      // Auto-detect business type from description
      const description = formData.businessDescription.toLowerCase();
      const detectedType = (
        description.includes('ecommerce') || 
        description.includes('store') || 
        description.includes('shop') || 
        description.includes('products') || 
        description.includes('cart') ||
        description.includes('sell')
      ) ? 'ecommerce' : 'basic';
      
      // Update store with form data
      updateBasicInfo({
        business_name: formData.businessName,
        business_type: detectedType,
        business_description: formData.businessDescription,
      });

      // Step 1: Create website if not already created
      let currentWebsiteId = website_id;
      setProgress(25);

      if (!currentWebsiteId) {
        console.log('Creating website...');
        
        // Call new ai-router create-website action
        const createResponse = await fetch('https://eilpazegjrcrwgpujqni.supabase.co/functions/v1/ai-router?action=create-website', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create-website',
            businessName: formData.businessName
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(`Failed to create website: ${errorData.detail?.message || 'Unknown error'}`);
        }

        const websiteData = await createResponse.json();
        console.log('Website created successfully:', websiteData);
        
        currentWebsiteId = websiteData.website_id;
        updateApiData({
          website_id: websiteData.website_id,
        });
      }

      setProgress(50);

      // Step 2: Generate sitemap
      if (currentWebsiteId) {
        console.log('Generating sitemap for website:', currentWebsiteId);
        
        // Call new ai-router generate-sitemap action
        const sitemapResponse = await fetch('https://eilpazegjrcrwgpujqni.supabase.co/functions/v1/ai-router?action=generate-sitemap', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate-sitemap',
            website_id: currentWebsiteId,
            params: {
              business_type: detectedType,
              business_name: formData.businessName,
              business_description: formData.businessDescription
            }
          })
        });

        if (!sitemapResponse.ok) {
          const errorData = await sitemapResponse.json();
          throw new Error(`Failed to generate sitemap: ${errorData.detail?.message || 'Unknown error'}`);
        }

        const sitemapData = await sitemapResponse.json();
        console.log('Sitemap generated successfully:', sitemapData);
        setProgress(75);

        // Auto-fill and update store
        updateApiData({ unique_id: sitemapData.unique_id });
        updateSEO({
          seo_title: sitemapData.seo.website_title,
          seo_description: sitemapData.seo.website_description,
          seo_keyphrase: sitemapData.seo.website_keyphrase,
        });
        updatePages(sitemapData.pages_meta);
        updateWebsiteType(sitemapData.website_type as 'basic' | 'ecommerce');
        updateDesign({
          colors: sitemapData.colors,
          fonts: {
            heading: 'Poppins',
            body: sitemapData.fonts.primary_font as any
          }
        });
      }

      setProgress(100);
      setHasAnalyzed(true);
      toast.success('Analysis complete! Your website structure is ready.');
      
    } catch (error) {
      console.error('Analysis failed with error:', error);
      
      // Create user-friendly error messages
      let errorMessage = 'Analysis failed. Please try again.';
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('network') || msg.includes('load failed') || msg.includes('fetch')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (msg.includes('timeout') || msg.includes('timed out')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (msg.includes('create website')) {
          errorMessage = 'Failed to create website. Please try again or contact support if the problem persists.';
        } else if (msg.includes('generate sitemap')) {
          errorMessage = 'Failed to generate sitemap. Please check your business information and try again.';
        } else if (msg.includes('unauthorized') || msg.includes('forbidden')) {
          errorMessage = 'Authentication error. Please refresh the page and try again.';
        } else if (msg.includes('server error') || (error as any).status >= 500) {
          errorMessage = 'Server error. Please try again in a few moments.';
        } else if (error.message && error.message !== 'Load failed' && !msg.includes('unknown error')) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        description: 'If the problem persists, please contact support.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    navigate({ to: '/onboarding/design' });
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Wizard Progress */}
        <div className="flex items-center justify-center mb-8 animate-slide-up">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {hasAnalyzed ? <Check className="h-4 w-4" /> : <span className="text-sm font-medium">1</span>}
              </div>
              <span className="ml-2 text-sm font-medium text-primary">
                {t('onboarding:wizard.step1')}
              </span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {t('onboarding:wizard.step2')}
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tell Us About Your Business
          </h1>
          <p className="text-lg text-muted-foreground">
            Just 2 simple questions - we'll create your perfect website from this.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-3xl border shadow-soft p-8 animate-slide-up">
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Business Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Smith & Associates Law Firm"
                        className="h-12 rounded-2xl border-2 touch-target"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Business Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your business, products, or services in detail..."
                        className="min-h-[120px] rounded-2xl border-2 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AI Generation Progress Banner */}
              {isAnalyzing && (
                <div className="bg-primary/10 rounded-2xl p-6 animate-slide-up border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-primary flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                      AI Generation in Progress
                    </h3>
                    <span className="text-sm text-primary/70">{progress}%</span>
                  </div>
                  <p className="text-sm text-primary/80 mb-4">
                    Analyzing your prompt and creating your website structure...
                  </p>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Canvas Preview - Sitemap Structure */}
              {hasAnalyzed && pages_meta && (
                <div className="bg-muted/50 rounded-2xl p-6 animate-slide-up">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Your Website Structure
                  </h3>
                  
                  {/* SEO Preview */}
                  <div className="mb-4 p-4 bg-background rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">SEO Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Title:</span> {seo_title}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Description:</span> {seo_description}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Keyphrase:</span> {seo_keyphrase}
                      </div>
                    </div>
                  </div>

                  {/* Pages Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {pages_meta.map((page) => (
                      <div key={page.id} className="bg-background rounded-lg p-3 text-center border">
                        <div className="text-sm font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground">{page.type}</div>
                        {page.sections && page.sections.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {page.sections.length} sections
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Website Type */}
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {website_type === 'basic' ? 'Standard Website' : 'E-commerce Store'}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="touch-target rounded-2xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common:global.back')}
                </Button>
                
                {!hasAnalyzed ? (
                  <Button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1 touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing & Creating Structure...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze & Create Structure
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleContinue}
                    className="flex-1 touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
                  >
                    Continue to Design & Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Brief;