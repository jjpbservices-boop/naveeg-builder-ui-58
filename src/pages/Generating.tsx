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

  const {
    website_id, unique_id, colors, fonts, pages_meta,
    seo_title, seo_description, seo_keyphrase,
    business_name, business_description, business_type, website_type,
    updateApiData,
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
        colors, 
        fonts: { primary_font: fonts.heading || fonts.body || 'Inter' }, 
        pages_meta,
        seo: { title: seo_title, description: seo_description, keyphrase: seo_keyphrase },
        website_type,
      });

      // Generate and publish - fix payload structure to match API expectations
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
      const publishResponse = await api.publishAndFrontWithPolling(website_id);

      clearInterval(stepInterval);
      setProgress(100);
      setIsGenerating(false);

      // Store API response URLs
      const apiData: any = {};
      if (publishResponse?.preview_url) apiData.preview_url = publishResponse.preview_url;
      if (publishResponse?.admin_url) apiData.admin_url = publishResponse.admin_url;
      if (Object.keys(apiData).length > 0) {
        updateApiData(apiData);
      }

      // Check auth before proceeding to ready page
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setShowAuthModal(true);
        return;
      }

      // Associate website with user and update URLs if authenticated
      if (website_id && session.user) {
        const updateData: any = { user_id: session.user.id };
        if (publishResponse?.preview_url) updateData.site_url = publishResponse.preview_url;
        if (publishResponse?.admin_url) updateData.admin_url = publishResponse.admin_url;
        
        await supabase
          .from('sites')
          .update(updateData)
          .eq('website_id', website_id);
      }

      toast({
        title: 'Website generated successfully!',
        description: 'Your website is ready for preview.'
      });

      setTimeout(() => navigate({ to: '/dashboard' }), 1000);

    } catch (error: any) {
      console.error('Generation error:', error);
      setError(error.message || 'Failed to generate website. Please try again.');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN' && showAuthModal) {
        setShowAuthModal(false);
        
        // Associate website with user after authentication
        if (website_id && session?.user) {
          const { preview_url, admin_url } = useOnboardingStore.getState();
          const updateData: any = { user_id: session.user.id };
          if (preview_url) updateData.site_url = preview_url;
          if (admin_url) updateData.admin_url = admin_url;
          
          await supabase
            .from('sites')
            .update(updateData)
            .eq('website_id', website_id);
        }
        
        // Continue to dashboard after auth
        setTimeout(() => navigate({ to: '/dashboard' }), 1000);
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
    navigate({ to: '/auth' });
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
                Your website has been generated successfully! To save and manage your website, please sign up for an account.
              </p>
              <div className="space-y-2">
                <Button onClick={handleSignUp} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up & Save Website
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