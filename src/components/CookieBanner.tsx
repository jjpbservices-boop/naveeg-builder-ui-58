import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    // Initialize analytics tracking here
    console.log('Cookies accepted - initializing tracking');
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    // Only essential cookies
    console.log('Cookies declined - essential only');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-elegant p-6 max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          <Cookie className="h-6 w-6 text-primary shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-sansation text-lg font-bold text-foreground mb-2">
              We use cookies
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              We use cookies to improve your browsing experience, analyze site traffic, and personalize content. 
              Essential cookies are required for the website to function properly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleAccept}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Accept all
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDecline}
              >
                Essential only
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Cookie Settings
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;