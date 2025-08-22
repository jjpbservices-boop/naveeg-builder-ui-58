import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function Brief() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  
  const {
    business_name,
    business_description,
    updateBasicInfo,
    updateApiData,
    updateSEO,
    updateDesign,
    updatePages,
    updateWebsiteType,
    setCurrentStep,
    website_id,
    seo_title,
    seo_description,
    seo_keyphrase
  } = useOnboardingStore();

  // Debug logging
  useEffect(() => {
    console.log('Brief Component Mount - Store State:', {
      business_name,
      business_description,
      website_id,
      seo_title,
      hasAnalyzedData: !!(website_id && seo_title)
    });
  }, []);

  // Check if we already have analyzed data
  useEffect(() => {
    console.log('Checking analyzed state:', { website_id, seo_title });
    if (website_id && seo_title) {
      console.log('Setting isAnalyzed to true');
      setIsAnalyzed(true);
    } else {
      console.log('Not setting isAnalyzed - missing data');
      setIsAnalyzed(false);
    }
  }, [website_id, seo_title]);

  const handleAnalyze = async () => {
    console.log('handleAnalyze called with:', { business_name, business_description });
    
    if (isLoading) {
      console.log('Already loading, ignoring click');
      return; // Prevent double-clicks
    }
    
    if (!business_name?.trim() || !business_description?.trim()) {
      console.log('Validation failed - missing fields');
      toast({
        title: 'Incomplete form',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('Starting analysis process...');
    
    try {
      // Step 1: Create website
      console.log('Step 1: Creating website...');
      const createResult = await api.createWebsite(business_name);
      console.log('Create website result:', createResult);
      
      if (!createResult.ok) {
        throw new Error('Failed to create website');
      }

      // Auto-detect business type
      const businessTypeKeywords = ['ecommerce', 'store', 'shop', 'products', 'cart'];
      const isEcommerce = businessTypeKeywords.some(keyword => 
        business_description.toLowerCase().includes(keyword)
      );
      const businessType = isEcommerce ? 'ecommerce' : 'basic';
      console.log('Detected business type:', businessType);

      // Step 2: Generate sitemap with progress updates
      console.log('Step 2: Generating sitemap...');
      toast({
        title: 'Generating sitemap...',
        description: 'This may take up to 2 minutes. Please wait.',
      });

      const sitemapResult = await api.generateSitemap(createResult.website_id, {
        business_type: businessType,
        business_name,
        business_description
      });
      console.log('Sitemap result:', sitemapResult);

      // Update store with all data
      console.log('Step 3: Updating store...');
      updateApiData({
        website_id: createResult.website_id,
        unique_id: sitemapResult.unique_id
      });

      updateSEO({
        seo_title: sitemapResult.seo.website_title,
        seo_description: sitemapResult.seo.website_description,
        seo_keyphrase: sitemapResult.seo.website_keyphrase
      });

      updateDesign({
        colors: sitemapResult.colors,
        fonts: {
          heading: 'Poppins',
          body: sitemapResult.fonts.primary_font
        }
      });

      updatePages(sitemapResult.pages_meta);
      updateWebsiteType(sitemapResult.website_type);

      console.log('Store updated, setting isAnalyzed to true');
      setIsAnalyzed(true);

      toast({
        title: 'Analysis complete!',
        description: 'Your website structure has been generated.',
      });

      // Navigate to design step
      console.log('Step 4: Navigating to design...');
      setCurrentStep(1);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        console.log('Attempting navigation to /design');
        navigate({ to: '/design' });
      }, 100);
      
    } catch (error: any) {
      console.error('Error during analyze:', error);
      
      let title = 'Analysis failed';
      let description = 'Please try again later.';
      
      // Handle specific error types
      if (error.code === 'TIMEOUT') {
        title = 'Request timeout';
        description = 'The analysis is taking longer than expected. Please try again with a shorter business description.';
      } else if (error.code === 'SITEMAP_FAILED') {
        title = 'Sitemap generation failed';
        description = 'Please adjust your business description and try again.';
      } else if (error.message?.includes('Template generation is in progress')) {
        title = 'Generation in progress';
        description = 'Your website is being generated. Please wait a moment and try again.';
      } else if (error.status === 504) {
        title = 'Server timeout';
        description = 'The server is taking longer than expected. Please try again in a moment.';
      }
      
      toast({
        title,
        description: error.message || description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    console.log('handleNextStep called');
    setCurrentStep(1);
    navigate({ to: '/design' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tell us about your business
            </h1>
            <p className="text-muted-foreground">
              We'll analyze your needs and create a custom website structure
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={business_name}
                  onChange={(e) => updateBasicInfo({ business_name: e.target.value })}
                  placeholder="Enter your business name"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_description">Business Description</Label>
                <Textarea
                  id="business_description"
                  value={business_description}
                  onChange={(e) => updateBasicInfo({ business_description: e.target.value })}
                  placeholder="Describe what your business does, your services, target audience..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {!isAnalyzed ? (
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !business_name?.trim() || !business_description?.trim()}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing & Creating Structure...
                    </>
                  ) : (
                    <>
                      Analyze & Create Structure
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">✅ Analysis Complete</p>
                    <p className="text-sm">Website structure generated successfully. Ready to proceed to design customization.</p>
                  </div>
                  <Button
                    onClick={handleNextStep}
                    className="w-full text-lg py-6"
                    size="lg"
                  >
                    Continue to Design
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}