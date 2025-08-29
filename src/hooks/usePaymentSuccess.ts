import { useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';

export const usePaymentSuccess = (siteId?: string) => {
  const { fetchSubscription } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');

    if (sessionId && success === 'true') {
      console.log('[PAYMENT_SUCCESS] Payment successful, refreshing subscription');
      
      // Show success message
      toast({
        title: '🎉 Payment Successful!',
        description: 'Your subscription has been activated. Refreshing your plan...',
      });

      // Immediate refresh with siteId context
      fetchSubscription(siteId);

      // Clean up URL parameters immediately
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Temporarily disabled to prevent auth cycling issues
      // setTimeout(() => {
      //   console.log(`[PAYMENT_SUCCESS] Retrying subscription fetch after 3s`);
      //   fetchSubscription(siteId);
      // }, 3000);
    }
  }, []); // Removed dependencies to prevent re-runs
};