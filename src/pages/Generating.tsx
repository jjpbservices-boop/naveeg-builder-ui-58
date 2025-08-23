import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const steps = ['Create website','Generate sitemap','Apply design','Generate pages','Publish pages','Set front page','Get preview link'];
const pctOf = (i: number) => Math.round((i / (steps.length - 1)) * 100);

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
        { title: 'Home', sections: [{ section_title: 'Hero' }] },
        { title: 'Contact', sections: [{ section_title: 'Get In Touch' }] },
      ],
  ...(s.colors ? { colors: s.colors } : {}),
  fonts: { primary_font: s.fonts?.primary_font || s.fonts?.body || 'Inter' },
});

async function finalizeSite(website_id: number) {
  return api.publishAndFrontWithPolling(website_id);
}

export default function Generating() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const {
    website_id, unique_id, colors, fonts, pages_meta,
    seo_title, seo_description, seo_keyphrase,
    business_name, business_description, business_type, website_type,
  } = useOnboardingStore();

  const generateWebsite = async () => {
    try {
      setError(null);
      setStep(2); // create + sitemap assumed done

      // Save design to DB
      await api.updateDesign(website_id, {
        colors, fonts, pages_meta,
        seo: { title: seo_title, description: seo_description, keyphrase: seo_keyphrase },
        website_type,
      });
      setStep(3);

      // Generate pages
      const params = buildParams({
        business_name, business_description, business_type,
        seo_title, seo_description, seo_keyphrase,
        pages_meta, colors, fonts, website_type,
      });
      await api.generateFromWithPolling(website_id, unique_id, params);
      setStep(4);

      // Publish + front page + URLs
      setStep(5);
      const { preview_url, admin_url } = await finalizeSite(website_id);
      setStep(6);

      toast({ title: 'Website generated successfully!', description: 'Your website is ready to view.' });
      useOnboardingStore.setState({ preview_url, admin_url });
      navigate({ to: '/ready' });
    } catch (e: any) {
      console.error('Generation error:', e);
      const msg =
        e?.message ||
        e?.detail?.message ||
        'Website generation failed. Please try again.';
      setError(msg);
    }
  };

  useEffect(() => {
    if (!website_id || !unique_id) {
      navigate({ to: '/brief' });
      return;
    }
    generateWebsite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await generateWebsite();
    setIsRetrying(false);
  };
  const handleGoBack = () => navigate({ to: '/design' });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader><CardTitle className="text-destructive">Generation Failed</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{error}</p>
                <div className="flex gap-4">
                  <Button onClick={handleRetry} disabled={isRetrying} className="flex-1">
                    {isRetrying ? (<><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Retrying…</>) : 'Try Again'}
                  </Button>
                  <Button variant="outline" onClick={handleGoBack} disabled={isRetrying}>
                    <ArrowLeft className="mr-2 h-4 w-4" />Back to Design
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const pct = pctOf(step);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Generating your website</CardTitle>
              <p className="text-muted-foreground">This may take a few minutes. Please do not close this page.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</span>
                  <span className="text-sm font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-sm mt-2 font-medium">{steps[step]}</p>
              </div>
              <div className="space-y-2">
                {steps.map((name, i) => (
                  <div key={name} className={`flex items-center text-sm ${i < step ? 'text-foreground' : i === step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    <span className="mr-3 w-6">{i < step ? '✓' : i === step ? '•' : '○'}</span>
                    {name}
                  </div>
                ))}
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  We coerce `business_type` to a valid 10Web value and ensure all six required fields are present.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}