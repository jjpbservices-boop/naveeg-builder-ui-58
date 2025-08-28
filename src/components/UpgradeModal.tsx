import React from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgradeType: 'starter-to-pro' | 'pro-to-custom';
  onUpgrade: () => void;
}

const featureComparisons = {
  'starter-to-pro': {
    title: 'Upgrade to Pro',
    subtitle: 'Everything you need to grow your business.',
    pricing: '€99/month',
    features: [
      { name: 'Pages', starter: '5 max', pro: 'Unlimited', available: true },
      { name: 'AI Content + Translations', starter: false, pro: true, available: true },
      { name: 'Advanced Design Studio', starter: false, pro: true, available: true },
      { name: 'Full SEO Suite', starter: false, pro: true, available: true },
      { name: 'Analytics (GA4 + GSC)', starter: false, pro: true, available: true },
      { name: 'Backups Restore/Staging', starter: 'Support only', pro: true, available: true },
      { name: 'Firewall + 2FA', starter: false, pro: true, available: true },
      { name: 'Store (WooCommerce)', starter: false, pro: true, available: true },
      { name: 'Form Builder + CRM Export', starter: false, pro: true, available: true },
      { name: 'Automations', starter: 'Demo only', pro: true, available: true },
      { name: 'Integrations', starter: 'Basic only', pro: true, available: true },
      { name: 'Support', starter: 'Docs only', pro: 'Chat + guided', available: true },
    ],
    cta: 'Upgrade to Pro',
  },
  'pro-to-custom': {
    title: 'Go Custom',
    subtitle: 'Enterprise-grade power and dedicated support.',
    pricing: 'Contact us',
    features: [
      'Enterprise security & compliance',
      'Multi-site dashboards', 
      'ERP & CRM integrations',
      'Dedicated account manager',
      'Custom API integrations',
      'Advanced workflow automations',
      'Priority feature requests',
      'SLA guarantees',
    ],
    cta: 'Book a call',
  },
};

export function UpgradeModal({ isOpen, onClose, upgradeType, onUpgrade }: UpgradeModalProps) {
  const comparison = featureComparisons[upgradeType];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">
                {comparison.title}
              </DialogTitle>
              <p className="text-muted-foreground mb-4">
                {comparison.subtitle}
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {comparison.pricing}
                </span>
                {upgradeType === 'starter-to-pro' && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {upgradeType === 'starter-to-pro' ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 text-sm font-medium">
                <div className="p-4 border-r">Feature</div>
                <div className="p-4 border-r text-center">Starter</div>
                <div className="p-4 text-center">Pro</div>
              </div>
              {comparison.features.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 border-t text-sm">
                  <div className="p-4 border-r font-medium">{feature.name}</div>
                  <div className="p-4 border-r text-center">
                    {typeof feature.starter === 'boolean' ? (
                      feature.starter ? (
                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className="text-muted-foreground">{feature.starter}</span>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className="text-foreground font-medium">{feature.pro}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparison.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1"
              variant={upgradeType === 'pro-to-custom' ? 'outline' : 'default'}
            >
              {comparison.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {upgradeType === 'starter-to-pro' && (
            <p className="text-xs text-center text-muted-foreground">
              7-day free trial • Cancel anytime • VAT included
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}