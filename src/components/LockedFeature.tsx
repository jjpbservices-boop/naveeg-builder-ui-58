import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

interface LockedFeatureProps {
  featureName: string;
  description: string;
  requiredPlan: 'pro' | 'custom';
  onUpgrade: () => void;
}

export function LockedFeature({ featureName, description, requiredPlan, onUpgrade }: LockedFeatureProps) {
  const { subscription } = useSubscription();

  const getPlanDisplayName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getUpgradeCTA = () => {
    if (requiredPlan === 'custom') {
      return 'Contact Sales';
    }
    return `Upgrade to ${getPlanDisplayName(requiredPlan)}`;
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Unlock {featureName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            {description} This feature is available on the {getPlanDisplayName(requiredPlan)} plan.
          </p>
          
          <Button 
            onClick={onUpgrade}
            size="lg"
            className="w-full mb-4"
            variant={requiredPlan === 'custom' ? 'outline' : 'default'}
          >
            {getUpgradeCTA()}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {requiredPlan === 'custom' 
              ? 'Get in touch with our enterprise team'
              : 'Upgrade anytime from your dashboard'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}