import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTrialFallback = (user: any, sites: any[], subscription: any) => {
  const { toast } = useToast();

  useEffect(() => {
    const createMissingTrial = async () => {
      // Only proceed if user has sites but no subscription
      if (!user?.id || !sites?.length || subscription) return;

      try {
        // Get the first site (most recent)
        const firstSite = sites[0];
        
        console.log('Creating missing trial for user', user.id, 'and site', firstSite.id);
        
        const { data: trialId, error } = await supabase
          .rpc('create_trial_subscription', {
            p_user_id: user.id,
            p_site_id: firstSite.id
          });

        if (error) {
          console.error('Error creating fallback trial:', error);
          return;
        }

        console.log('Successfully created fallback trial:', trialId);
        
        toast({
          title: '🎉 Welcome to your 7-day free trial!',
          description: 'Your trial has been activated. Enjoy all features for free.',
        });

        // Refresh the page to update subscription state
        window.location.reload();
      } catch (error) {
        console.error('Error in trial fallback:', error);
      }
    };

    // Delay to ensure other subscription checks have completed
    const timer = setTimeout(createMissingTrial, 2000);
    return () => clearTimeout(timer);
  }, [user?.id, sites?.length, subscription, toast]);
};