import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const Ready: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  const handleContinue = () => {
    navigate({ to: '/preview' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl text-center">
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
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Congratulations! Your professional website has been created and is ready to go live. 
            Let's take a look at what we've built for you.
          </p>

          {/* Features List */}
          <div className="bg-card rounded-3xl border shadow-soft p-8 mb-8">
            <h3 className="font-semibold text-lg mb-6">What's included:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span>Responsive design for all devices</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span>SEO-optimized content</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span>Fast loading performance</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span>Secure SSL certificate</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span>Professional navigation</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span>Contact forms and CTAs</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleContinue}
            size="lg"
            className="touch-target bg-gradient-primary hover:bg-primary-hover text-white font-semibold rounded-2xl px-8 py-4 text-lg"
          >
            Let's Go
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Next Steps */}
          <div className="mt-8 p-6 bg-muted rounded-2xl">
            <p className="text-sm text-muted-foreground">
              <strong>Next:</strong> Preview your website, make any final adjustments, 
              and then publish it to the world!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ready;