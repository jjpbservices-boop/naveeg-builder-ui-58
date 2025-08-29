import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTrialFallback = (user: any, sites: any[], subscription: any, onTrialCreated?: () => void) => {
  const { toast } = useToast();
  const processingRef = useRef(false);
  const createdTrialRef = useRef(false);

  useEffect(() => {
    const createMissingTrial = async () => {
      // Prevent multiple simultaneous executions
      if (processingRef.current || createdTrialRef.current) return;
      
      // Only proceed if user has sites but no subscription
      if (!user?.id || !sites?.length || subscription) return;

      // Rate limiting: only run once per component lifecycle
      processingRef.current = true;

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
        createdTrialRef.current = true;
        
        toast({
          title: '🎉 Welcome to your 7-day free trial!',
          description: 'Your trial has been activated. Enjoy all features for free.',
        });

        // Instead of page reload, trigger subscription refetch
        if (onTrialCreated) {
          onTrialCreated();
        }
      } catch (error) {
        console.error('Error in trial fallback:', error);
      } finally {
        processingRef.current = false;
      }
    };

    // Delay to ensure other subscription checks have completed
    const timer = setTimeout(createMissingTrial, 2000);
    return () => clearTimeout(timer);
  }, [user?.id, sites?.length, subscription, toast, onTrialCreated]);
};