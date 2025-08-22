import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { apiClient } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader, Circle, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Generate: React.FC = () => {
  const { t } = useTranslation(['progress', 'common']);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { 
    siteId,
    colors,
    fonts,
    pages_meta,
    website_type,
    seo_title,
    seo_description,
    seo_keyphrase,
    updateApiData,
    setError,
    error
  } = useOnboardingStore();

  const steps = [
    'Updating design preferences',
    'Generating website content',
    'Optimizing layout',
    'Setting up navigation',
    'Finalizing pages',
    'Preparing launch',
    'Website ready!'
  ];

  useEffect(() => {
    if (!siteId) {
      navigate({ to: '/onboarding/brief' });
      return;
    }

    startGeneration();
  }, [siteId, navigate]);

  // Set up auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);
    setHasError(false);
    setError(undefined);

    try {
      // Step 1: Update design preferences
      await updateSiteWithDesignPreferences();
      setCurrentStep(1);
      setProgress(25);
      
      // Step 2: Generate from sitemap
      const { data, error: generateError } = await apiClient.generateFromSitemap(siteId!);
      
      if (generateError) {
        throw new Error(generateError.message || 'Failed to generate website');
      }
      
      updateApiData({ preview_url: data!.url });
      setCurrentStep(2);
      setProgress(50);
      
      // Step 3: Show auth modal and attach site
      setShowAuthModal(true);
      await simulateRemainingProgress();
      
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setError(errorMessage);
      setHasError(true);
      toast.error(errorMessage);
      setIsGenerating(false);
    }
  };

  const updateSiteWithDesignPreferences = async () => {
    if (!siteId) throw new Error('No site ID available');
    
    const { error } = await apiClient.updateDesign({
      siteId,
      colors,
      fonts,
      pages_meta,
      website_type,
      seo_title,
      seo_description,
      seo_keyphrase,
    });

    if (error) {
      throw new Error(error.message || 'Failed to update design preferences');
    }
  };

  const simulateRemainingProgress = async () => {
    for (let step = 3; step < steps.length; step++) {
      setCurrentStep(step);
      setProgress(50 + ((step - 2) / (steps.length - 2)) * 50);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        toast.success('Account created! Please check your email to verify your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }

      // Attach site to user
      await attachSiteToUser();
      
    } catch (error) {
      console.error('Auth failed:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const attachSiteToUser = async () => {
    if (!siteId) return;
    
    try {
      const { error } = await apiClient.attachSite({ siteId });
      if (error) {
        console.error('Failed to attach site:', error);
        // Don't throw here, just log - the site is still generated
      }

      setShowAuthModal(false);
      setProgress(100);
      toast.success('Website generated and attached to your account!');
      setTimeout(() => navigate({ to: '/ready' }), 1500);
      
    } catch (error) {
      console.error('Failed to attach site:', error);
      // Still proceed to ready page
      setShowAuthModal(false);
      setProgress(100);
      setTimeout(() => navigate({ to: '/ready' }), 1500);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setProgress(0);
    startGeneration();
  };

  const handleGoBack = () => {
    navigate({ to: '/onboarding/design' });
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-card rounded-3xl border shadow-soft p-8">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            
            <h1 className="font-syne text-2xl md:text-3xl font-bold text-foreground mb-4">
              Generation Failed
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {error || 'Something went wrong while generating your website. Please try again.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="touch-target rounded-2xl"
              >
                Go Back to Design
              </Button>
              <Button
                onClick={handleRetry}
                className="touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="animate-slide-up">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-6">
            Building Your Website
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Please wait while we create your professional website...
          </p>

          <div className="bg-card rounded-3xl border shadow-soft p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            {/* Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  ) : index === currentStep ? (
                    <Loader className="h-5 w-5 text-primary flex-shrink-0 animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`${index <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Estimated Time */}
            {isGenerating && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Almost done! Just a few more seconds...
                </p>
              </div>
            )}
          </div>

          {/* Fun Fact */}
          <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">
              <strong>Did you know?</strong> We're using AI to craft each page specifically 
              for your business, ensuring your website stands out from the crowd.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Create Your Account
            </DialogTitle>
            <DialogDescription>
              Create an account to save and manage your website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="mt-1"
              />
            </div>
            
            <Button
              onClick={handleAuth}
              disabled={!email || !password || isAuthenticating}
              className="w-full"
            >
              {isAuthenticating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Continue'
              )}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
              >
                {authMode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Generate;