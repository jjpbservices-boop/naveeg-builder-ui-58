import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';

export function TrialBanner() {
  const navigate = useNavigate();
  const { subscription, isTrialActive, getTrialDaysLeft } = useSubscription();
  const { t } = useTranslation();

  // Show only when status='trialing'
  if (!subscription || subscription.status !== 'trialing') return null;

  const trialDaysLeft = getTrialDaysLeft();

  const handleChoosePlan = () => {
    navigate({ to: '/plans' });
  };

  const handleUpgrade = () => {
    navigate({ to: '/plans' });
  };

  return (
    <Card className="mx-6 mt-4 mb-2 border-accent bg-accent/10 dark:bg-accent/20 dark:border-accent/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 dark:bg-accent/40">
            <Clock className="h-4 w-4 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {t('trialBanner.message')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('trialBanner.subtitle')}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="bg-accent-foreground hover:bg-accent-foreground/90 text-accent font-medium"
          >
            {t('trialBanner.upgrade')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}