import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, ArrowLeft, UserPlus } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { api, updateDesign } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { EnhancedLoading } from '@/components/EnhancedLoading';
import { supabase } from '@/integrations/supabase/client';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const {
    website_id, unique_id, colors, fonts, pages_meta,
    seo_title, seo_description, seo_keyphrase,
    business_name, business_description, business_type, website_type,
    updateApiData,
  } = useOnboardingStore();

  const generateWebsite = async () => {
    try {
      setError(null);
      
      // Simulate progress through initial steps
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev < 2 ? prev + 1 : prev; // Stop at step 2 (content generation)
          setProgress(Math.min(((next + 1) / generationSteps.length) * 60, 60));
          return next;
        });
      }, 2000);

      // Save design
      await updateDesign(website_id, {
        colors, 
        fonts: { primary_font: fonts.heading || fonts.body || 'Inter' }, 
        pages_meta,
        seo: { title: seo_title, description: seo_description, keyphrase: seo_keyphrase },
        website_type,
      });

      // Generate website structure - fix payload structure to match API expectations
      const onboardingData = {
        business_name, 
        business_description, 
        business_type,
        website_title: seo_title,
        website_description: seo_description,
        website_keyphrase: seo_keyphrase,
        pages_meta, 
        colors, 
        fonts: { primary_font: fonts.heading || fonts.body || 'Inter' }, 
        website_type,
      };
      
      const generateResponse = await api.generateFromWithPolling(website_id, unique_id, onboardingData);
      
      clearInterval(stepInterval);
      
      // Store generation data and complete the current step
      setGeneratedData({ generateResponse, onboardingData });
      setCurrentStep(2); // Complete content generation step
      setProgress(60);
      
      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No authenticated user, showing auth modal');
        setIsGenerating(false);
        setShowAuthModal(true);
        return;
      }
      
      console.log('User is authenticated:', session.user.id);
      // Continue with publishing if already authenticated
      await completeWebsiteGeneration(session.user);

    } catch (error: any) {
      console.error('Generation error:', error);
      setError(error.message || 'Failed to generate website. Please try again.');
      setIsGenerating(false);
    }
  };

  const completeWebsiteGeneration = async (user: any) => {
    try {
      setCurrentStep(3); // Publishing step
      setProgress(80);
      
      const publishResponse = await api.publishAndFrontWithPolling(website_id);
      
      setCurrentStep(4); // Final optimizations
      setProgress(100);
      
      console.log('Full publish response:', publishResponse);
      
      // CRITICAL: Always associate with current user regardless of URLs
      console.log('Associating website with authenticated user:', user.id);
      
      const urlUpdateData: any = { 
        user_id: user.id,
        status: publishResponse?.preview_url ? 'published' : 'generating'
      };
      
      if (publishResponse?.preview_url) {
        urlUpdateData.site_url = publishResponse.preview_url;
        updateApiData({ preview_url: publishResponse.preview_url });
        console.log('Adding site URL:', publishResponse.preview_url);
      }
      if (publishResponse?.admin_url) {
        urlUpdateData.admin_url = publishResponse.admin_url;
        updateApiData({ admin_url: publishResponse.admin_url });
        console.log('Adding admin URL:', publishResponse.admin_url);
      }
      
      console.log('Updating website with data:', urlUpdateData);
      
      const { data: urlUpdateResult, error: urlUpdateError } = await supabase
        .from('sites')
        .update(urlUpdateData)
        .eq('website_id', website_id)
        .select();
        
      if (urlUpdateError) {
        console.error('CRITICAL: Failed to update website:', urlUpdateError);
        throw new Error('Failed to save website data');
      } else {
        console.log('SUCCESS: Website updated:', urlUpdateResult);
      }

      toast({
        title: 'Website generated successfully!',
        description: 'Your website is ready for preview.'
      });

      setIsGenerating(false);
      setTimeout(() => navigate({ to: '/dashboard' }), 1000);

    } catch (error: any) {
      console.error('Publishing error:', error);
      setError(error.message || 'Failed to publish website. Please try again.');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN' && showAuthModal && session?.user) {
        setShowAuthModal(false);
        setIsGenerating(true);
        
        // Complete website generation and publishing with authenticated user
        await completeWebsiteGeneration(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    if (!website_id || !unique_id) {
      navigate({ to: '/brief' });
      return;
    }
    generateWebsite();

    return () => subscription.unsubscribe();
  }, [website_id, unique_id]);

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    setIsGenerating(true);
    setShowAuthModal(false);
    generateWebsite();
  };

  const handleSignUp = () => {
    navigate({ to: '/auth?context=generation' });
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

  return (
    <>
      {showAuthModal && (
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Almost Done! 🎉</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Sign up or sign in to publish and preview your website.
              </p>
              <div className="space-y-2">
                <Button onClick={handleSignUp} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up or Sign In
                </Button>
                <p className="text-xs text-muted-foreground">
                  Free account • No credit card required
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {!showAuthModal && null}
    </>
  );
}