import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, ExternalLink, Settings, Copy, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const Ready: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isGettingAdminUrl, setIsGettingAdminUrl] = useState(false);

  const {
    business_name,
    website_id,
    preview_url,
    admin_url,
    colors,
    fonts,
    pages_meta,
    website_type,
  } = useOnboardingStore();

  useEffect(() => {
    if (!website_id) {
      navigate({ to: '/' });
      return;
    }

    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, [website_id, navigate]);

  const handleGoToAdmin = async () => {
    if (!website_id) {
      toast.error('Missing website information for admin access');
      return;
    }

    if (!admin_url) {
      toast.error('Admin URL not available');
      return;
    }

    setIsGettingAdminUrl(true);
    try {
      const { data, error } = await apiClient.getAutologinUrl(
        website_id.toString(),
        admin_url
      );

      if (error) {
        // If autologin fails, still open the regular admin URL
        console.error('Autologin failed:', error);
        window.open(admin_url, '_blank');
        toast.success('Admin panel opened! You may need to log in manually.');
        return;
      }

      // Open admin URL in new tab
      window.open(data!.admin_url, '_blank');
      toast.success('Admin panel opened in new tab!');
      
    } catch (error) {
      console.error('Failed to get admin access:', error);
      // Fallback to regular admin URL
      if (admin_url) {
        window.open(admin_url, '_blank');
        toast.success('Admin panel opened! You may need to log in manually.');
      } else {
        toast.error('Admin panel not available');
      }
    } finally {
      setIsGettingAdminUrl(false);
    }
  };

  const handleCopyPayload = () => {
    const debugPayload = {
      website_id,
      business_name,
      website_type,
      colors,
      fonts,
      pages_meta,
      urls: {
        preview_url,
        admin_url,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(debugPayload, null, 2));
    toast.success('Debug payload copied to clipboard!');
  };

  const handlePreview = () => {
    if (preview_url) {
      window.open(preview_url, '_blank');
    } else {
      toast.error('No preview URL available');
    }
  };

  const handleStartOver = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div className="animate-bounce-in">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-success text-success-foreground rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-12 w-12" />
          </div>

          {/* Title */}
          <h1 className="font-syne text-4xl md:text-5xl font-bold text-foreground mb-6">
            🎉 Your website is ready!
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Congratulations! <strong>{business_name}</strong> now has a professional website 
            that's ready to attract customers and grow your business.
          </p>

          {/* Website Info Card */}
          <div className="bg-card rounded-3xl border shadow-soft p-8 mb-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Website Preview */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center justify-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Your Website
                </h3>
                
                {/* Mock browser preview */}
                <div className="bg-muted rounded-lg border overflow-hidden">
                  {/* Browser chrome */}
                  <div className="bg-muted-foreground/10 px-4 py-2 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-xs text-muted-foreground text-center">
                      {preview_url}
                    </div>
                  </div>
                  
                  {/* Website preview */}
                  <div className="p-6 bg-background">
                    <h4 
                      className="text-lg font-bold mb-2"
                      style={{ 
                        color: colors.primary_color,
                        fontFamily: fonts.heading === 'Syne' ? 'Syne' : 'inherit'
                      }}
                    >
                      {business_name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Welcome to our {website_type === 'ecommerce' ? 'online store' : 'website'}
                    </p>
                    <div className="space-y-1">
                      {pages_meta.slice(0, 4).map((page) => (
                        <div key={page.id} className="text-xs p-1 bg-muted/50 rounded">
                          {page.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  What's Included
                </h3>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Responsive design for all devices</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">SEO-optimized content</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Fast loading performance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Secure SSL certificate</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Professional navigation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm">Contact forms and CTAs</span>
                  </div>
                  {website_type === 'ecommerce' && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm">E-commerce functionality</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-2xl mx-auto">
            <Button
              onClick={handlePreview}
              size="lg"
              className="touch-target bg-gradient-primary hover:bg-primary-hover text-white font-semibold rounded-2xl px-8 py-4 text-lg flex-1"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Preview Website
            </Button>
            
            <Button
              onClick={handleGoToAdmin}
              disabled={isGettingAdminUrl}
              variant="outline"
              size="lg"
              className="touch-target rounded-2xl px-8 py-4 text-lg flex-1"
            >
              {isGettingAdminUrl ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                  Getting Access...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-5 w-5" />
                  Admin Panel
                </>
              )}
            </Button>
          </div>

          {/* Next Steps */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>1. Preview:</strong> Check out your new website and see how it looks
              </p>
              <p>
                <strong>2. Customize:</strong> Use the admin panel to make any final adjustments
              </p>
              <p>
                <strong>3. Launch:</strong> Your website is already live and ready for visitors!
              </p>
            </div>
          </div>

          {/* Debug Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="ghost"
              onClick={handleCopyPayload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Debug Info
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleStartOver}
              className="text-muted-foreground hover:text-foreground"
            >
              Create Another Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ready;