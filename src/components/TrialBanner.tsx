import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

export function TrialBanner() {
  const navigate = useNavigate();
  const { subscription, isTrialActive, getTrialDaysLeft } = useSubscription();

  if (!subscription || !isTrialActive()) return null;

  const trialDaysLeft = getTrialDaysLeft();

  const handleChoosePlan = () => {
    navigate({ to: '/plans' });
  };

  return (
    <Card className="mx-6 mt-4 mb-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800/30">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              🎉 You are on a 7-day free trial. {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left until your website is deactivated unless you subscribe.
            </p>
          </div>
        </div>
        <Button 
          onClick={handleChoosePlan}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white font-medium"
        >
          Choose a Plan
        </Button>
      </div>
    </Card>
  );
}