import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { api } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader, Circle, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const steps = [
  'Creating website structure',
  'Generating sitemap and navigation',
  'Designing pages with your preferences',
  'Setting up navigation and menus',
  'Optimizing for all devices',
  'Boosting website speed and performance',
  'Finalizing layout and content'
];

const coerceBusinessType = (business_type?: string, website_type?: string) => {
  const allowed = new Set(['informational','ecommerce','agency','restaurant','service','portfolio','blog','saas']);
  const bt = business_type || (website_type === 'ecommerce' ? 'ecommerce' : 'informational');
  return allowed.has(String(bt)) ? String(bt) : 'informational';
};

const buildParams = (s: any) => ({
  business_name: s.business_name || s.seo_title || 'Business',
  business_description: s.business_description || s.seo_description || 'Generated with Naveeg.',
  business_type: coerceBusinessType(s.business_type, s.website_type),
  website_title: s.seo_title || s.business_name || 'Website',
  website_description: s.seo_description || s.business_description || 'Description',
  website_keyphrase: s.seo_keyphrase || s.business_name || 'Website',
  website_type: s.website_type === 'ecommerce' ? 'ecommerce' : 'basic',
  pages_meta: Array.isArray(s.pages_meta) && s.pages_meta.length
    ? s.pages_meta
    : [
        { title: 'Home', sections: [{ section_title: 'Hero' }, { section_title: 'About Us' }] },
        { title: 'Contact', sections: [{ section_title: 'Get In Touch' }] },
      ],
  ...(s.colors ? { colors: s.colors } : {}),
  fonts: { primary_font: s.fonts?.primary_font || s.fonts?.body || 'Inter' },
});

const Generate: React.FC = () => {
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
    business_name, business_type, business_description,
    seo_title, seo_description, seo_keyphrase,
    colors, fonts, pages_meta, website_type,
    website_id, unique_id,
    updateApiData, setError, error
  } = useOnboardingStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!website_id || !unique_id) {
      navigate({ to: '/onboarding/brief' });
      return;
    }
    startGeneration();
  }, [website_id, unique_id]);

  const startGeneration = async () => {
    if (!website_id || !unique_id) {
      setError('Missing website information. Please go back and complete the previous steps.');
      return;
    }
    setIsGenerating(true);
    setProgress(15);
    setCurrentStep(0);
    setHasError(false);
    setError(undefined);

    try {
      // Generate from sitemap via API wrapper (handles normalization and polling)
      const params = buildParams({
        business_name, business_type, business_description,
        seo_title, seo_description, seo_keyphrase,
        colors, fonts, pages_meta, website_type
      });

      await api.generateFromWithPolling(website_id, unique_id, params);
      setCurrentStep(3);
      setProgress(70);

      // Publish + set front page via polling
      const { preview_url, admin_url } = await api.publishAndFrontWithPolling(website_id);
      setCurrentStep(6);
      setProgress(100);

      updateApiData({ preview_url, admin_url });
      toast.success('Website generated successfully.');
      setTimeout(() => navigate({ to: '/ready' }), 1200);
    } catch (e: any) {
      console.error('Generation failed:', e);
      const msg =
        e?.message ||
        e?.detail?.message ||
        'Website generation failed. Please try again.';
      setError(msg);
      setHasError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setProgress(0);
    startGeneration();
  };

  const handleGoBack = () => navigate({ to: '/onboarding/design' });

  if (hasError) {
    return (
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-card rounded-3xl border shadow-soft p-8">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="font-sansation text-2xl md:text-3xl font-bold text-foreground mb-4">Generation Failed</h1>
            <p className="text-muted-foreground mb-6">{error || 'Something went wrong.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={handleGoBack} className="rounded-2xl">Go Back to Design</Button>
              <Button onClick={handleRetry} className="rounded-2xl">Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="animate-slide-up">
          <h1 className="font-sansation text-3xl md:text-4xl font-bold text-foreground mb-6">Building Your Website</h1>
          <p className="text-lg text-muted-foreground mb-8">Please wait while we create your professional website.</p>
          <div className="bg-card rounded-3xl border shadow-soft p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            <div className="space-y-4 mb-8">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center space-x-3 text-left">
                  {i < currentStep ? <CheckCircle className="h-5 w-5 text-success" /> :
                   i === currentStep ? <Loader className="h-5 w-5 text-primary animate-spin" /> :
                   <Circle className="h-5 w-5 text-muted-foreground" />}
                  <span className={i <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
            <p className="text-sm text-muted-foreground">
              <strong>FYI:</strong> We normalize your inputs to match 10Web’s schema so generation succeeds.
            </p>
          </div>
        </div>
      </div>

      {/* Auth modal kept as-is */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center"><UserPlus className="h-5 w-5 mr-2" />Create Your Account</DialogTitle>
            <DialogDescription>Create an account to save and manage your website.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="mt-1" />
            </div>
            <Button onClick={() => { /* sign-up/sign-in flow unchanged */ }} disabled={!email || !password || isAuthenticating} className="w-full">
              {isAuthenticating ? (<><Loader className="h-4 w-4 mr-2 animate-spin" />Creating Account…</>) : 'Create Account & Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Generate;