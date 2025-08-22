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
  businessType: z.string().min(1, 'Business type is required'),
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
    business_type,
    business_description,
    seo_title,
    seo_description,
    seo_keyphrase,
    siteId,
    unique_id,
    pages_meta,
    website_type,
    updateBasicInfo,
    updateSEO,
    updateApiData,
    updatePages,
    updateWebsiteType,
    setError,
  } = useOnboardingStore();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      businessName: business_name,
      businessType: business_type,
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
      // Update store with form data
      updateBasicInfo({
        business_name: formData.businessName,
        business_type: formData.businessType,
        business_description: formData.businessDescription,
      });

      // Step 1: Create website if not already created
      let currentSiteId = siteId;
      setProgress(25);

      if (!currentSiteId) {
        const { data: websiteData, error: createError } = await apiClient.createWebsite({
          siteTitle: formData.businessName,
        });

        if (createError) {
          throw new Error(createError.message || 'Failed to create website');
        }

        currentSiteId = websiteData!.siteId;
        updateApiData({
          siteId: websiteData!.siteId,
          website_id: websiteData!.website_id,
        });
      }

      setProgress(50);

      // Step 2: Generate sitemap
      if (currentSiteId) {
        const { data: sitemapData, error: sitemapError } = await apiClient.generateSitemap({
          siteId: currentSiteId,
          business_type: formData.businessType,
          business_name: formData.businessName,
          business_description: formData.businessDescription,
        });

        if (sitemapError) {
          throw new Error(sitemapError.message || 'Failed to generate sitemap');
        }

        setProgress(75);

        // Auto-fill and update store
        const autoSeoTitle = sitemapData!.seo.seo_title || formData.businessName;
        const autoSeoDescription = sitemapData!.seo.seo_description || formData.businessDescription.substring(0, 160);
        const autoSeoKeyphrase = sitemapData!.seo.seo_keyphrase || formData.businessName;

        updateApiData({ unique_id: sitemapData!.unique_id });
        updateSEO({
          seo_title: autoSeoTitle,
          seo_description: autoSeoDescription,
          seo_keyphrase: autoSeoKeyphrase,
        });
        updatePages(sitemapData!.pages_meta);
        updateWebsiteType(sitemapData!.website_type as 'basic' | 'ecommerce');
      }

      setProgress(100);
      setHasAnalyzed(true);
      toast.success('Analysis complete! Your website structure is ready.');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setError(errorMessage);
      toast.error(errorMessage);
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
            Describe Your Website
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us about your business and we'll create the perfect website for you.
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
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Business Type
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., agency, restaurant, salon, plumber, bakery, ecommerce"
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

              {/* Canvas Preview */}
              {hasAnalyzed && pages_meta && (
                <div className="bg-muted/50 rounded-2xl p-6 animate-slide-up">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Your Website Structure
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {pages_meta.map((page) => (
                      <div key={page.id} className="bg-background rounded-lg p-3 text-center border">
                        <div className="text-sm font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground">{page.type}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
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
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleContinue}
                    className="flex-1 touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
                  >
                    Next Step
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