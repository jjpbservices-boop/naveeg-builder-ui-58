import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { apiClient } from '@/lib/api';
import { generateSubdomain } from '@/lib/slug';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ArrowLeft, Check, Loader, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const briefSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.enum(['informational', 'ecommerce', 'restaurant', 'services', 'portfolio', 'blog']),
  businessDescription: z.string().min(10, 'Please provide a more detailed description'),
  websiteTitle: z.string().min(1, 'Website title is required'),
  websiteDescription: z.string().max(160, 'Description should be 160 characters or less'),
  websiteKeyphrase: z.string().min(1, 'Keyphrase is required'),
});

type BriefFormData = z.infer<typeof briefSchema>;

const Brief: React.FC = () => {
  const { t } = useTranslation(['onboarding', 'common']);
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  const {
    email,
    business_name,
    business_type,
    business_description,
    seo_title,
    seo_description,
    seo_keyphrase,
    siteId,
    unique_id,
    updateBasicInfo,
    updateSEO,
    updateApiData,
    setError,
  } = useOnboardingStore();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      email: email,
      businessName: business_name,
      businessType: business_type as any || 'services',
      businessDescription: business_description,
      websiteTitle: seo_title,
      websiteDescription: seo_description,
      websiteKeyphrase: seo_keyphrase,
    },
  });

  const handleAnalyze = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    setIsAnalyzing(true);
    setError(undefined);

    try {
      // Update store with form data
      updateBasicInfo({
        email: formData.email,
        business_name: formData.businessName,
        business_type: formData.businessType,
        business_description: formData.businessDescription,
      });
      
      updateSEO({
        seo_title: formData.websiteTitle,
        seo_description: formData.websiteDescription,
        seo_keyphrase: formData.websiteKeyphrase,
      });

      // Step 1: Create website if not already created
      let currentSiteId = siteId;
      let currentUniqueId = unique_id;

      if (!currentSiteId) {
        const subdomainSlug = generateSubdomain(formData.businessName);
        
        const { data: websiteData, error: createError } = await apiClient.createWebsite({
          email: formData.email,
          subdomainSlug,
          siteTitle: formData.websiteTitle,
          businessName: formData.businessName,
          businessType: formData.businessType,
          businessDescription: formData.businessDescription,
          seoTitle: formData.websiteTitle,
          seoDescription: formData.websiteDescription,
          seoKeyphrase: formData.websiteKeyphrase,
        });

        if (createError) {
          throw new Error(createError.message || 'Failed to create website');
        }

        currentSiteId = websiteData!.siteId;
        updateApiData({
          siteId: websiteData!.siteId,
          website_id: websiteData!.website_id,
          site_url: websiteData!.site_url,
          admin_url: websiteData!.admin_url,
        });

        toast.success('Website created successfully!');
      }

      // Step 2: Generate sitemap if not already done
      if (!currentUniqueId && currentSiteId) {
        const { data: sitemapData, error: sitemapError } = await apiClient.generateSitemap(currentSiteId);

        if (sitemapError) {
          throw new Error(sitemapError.message || 'Failed to generate sitemap');
        }

        updateApiData({ unique_id: sitemapData!.unique_id });
        toast.success('Sitemap generated successfully!');
      }

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
    const formData = form.getValues();
    
    // Update store one more time before navigation
    updateBasicInfo({
      email: formData.email,
      business_name: formData.businessName,
      business_type: formData.businessType,
      business_description: formData.businessDescription,
    });
    
    updateSEO({
      seo_title: formData.websiteTitle,
      seo_description: formData.websiteDescription,
      seo_keyphrase: formData.websiteKeyphrase,
    });

    navigate({ to: '/onboarding/design' });
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const businessTypeOptions = [
    { value: 'informational', label: t('onboarding:brief.businessTypeOptions.informational') },
    { value: 'ecommerce', label: t('onboarding:brief.businessTypeOptions.ecommerce') },
    { value: 'restaurant', label: t('onboarding:brief.businessTypeOptions.restaurant') },
    { value: 'services', label: t('onboarding:brief.businessTypeOptions.services') },
    { value: 'portfolio', label: t('onboarding:brief.businessTypeOptions.portfolio') },
    { value: 'blog', label: t('onboarding:brief.businessTypeOptions.blog') },
  ];

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
            {t('onboarding:brief.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('onboarding:brief.subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-3xl border shadow-soft p-8 animate-slide-up">
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
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
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {t('onboarding:brief.businessName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('onboarding:brief.businessNamePlaceholder')}
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
                      {t('onboarding:brief.businessType')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-2 touch-target">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      {t('onboarding:brief.businessDescription')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('onboarding:brief.businessDescriptionPlaceholder')}
                        className="min-h-[120px] rounded-2xl border-2 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="websiteTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {t('onboarding:brief.websiteTitle')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('onboarding:brief.websiteTitlePlaceholder')}
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
                  name="websiteKeyphrase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {t('onboarding:brief.websiteKeyphrase')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('onboarding:brief.websiteKeyphrasePlaceholder')}
                          className="h-12 rounded-2xl border-2 touch-target"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="websiteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {t('onboarding:brief.websiteDescription')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('onboarding:brief.websiteDescriptionPlaceholder')}
                        className="min-h-[80px] rounded-2xl border-2 resize-none"
                        maxLength={160}
                        {...field}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground text-right">
                      {field.value?.length || 0}/160
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sitemap Preview */}
              {hasAnalyzed && (
                <div className="bg-muted/50 rounded-2xl p-6 animate-slide-up">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Your Website Structure
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: 'Home', type: 'home' },
                      { name: 'About', type: 'about' },
                      { name: 'Services', type: 'services' },
                      { name: 'Contact', type: 'contact' },
                    ].map((page, index) => (
                      <div key={page.name} className="bg-background rounded-lg p-3 text-center border">
                        <div className="text-sm font-medium">{page.name}</div>
                        <div className="text-xs text-muted-foreground">{page.type}</div>
                      </div>
                    ))}
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
                    Continue to Design
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