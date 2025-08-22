import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { createWebsite, generateSitemap } from '@/lib/api';
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

  // Check if we already have analyzed data
  useEffect(() => {
    if (website_id && seo_title) {
      setIsAnalyzed(true);
    }
  }, [website_id, seo_title]);

  const handleAnalyze = async () => {
    if (!business_name?.trim() || !business_description?.trim()) {
      toast({
        title: 'Incomplete form',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Step 1: Create website
      const createResult = await createWebsite(business_name);
      
      if (!createResult.ok) {
        throw new Error('Failed to create website');
      }

      // Auto-detect business type
      const businessTypeKeywords = ['ecommerce', 'store', 'shop', 'products', 'cart'];
      const isEcommerce = businessTypeKeywords.some(keyword => 
        business_description.toLowerCase().includes(keyword)
      );
      const businessType = isEcommerce ? 'ecommerce' : 'basic';

      // Step 2: Generate sitemap
      const sitemapResult = await generateSitemap(createResult.website_id, {
        business_type: businessType,
        business_name,
        business_description
      });

      // Update store with all data
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

      setIsAnalyzed(true);

      toast({
        title: 'Analysis complete!',
        description: 'Your website structure has been generated.',
      });

      // Navigate to design step
      setCurrentStep(1);
      navigate({ to: '/design' });
      
    } catch (error) {
      console.error('Error during analyze:', error);
      toast({
        title: 'Analysis failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
                <Button
                  onClick={() => {
                    setCurrentStep(1);
                    navigate({ to: '/design' });
                  }}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  Next Step
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}