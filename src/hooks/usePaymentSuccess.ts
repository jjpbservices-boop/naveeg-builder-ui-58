import { useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';

export const usePaymentSuccess = () => {
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

      // Immediate refresh, then multiple retries to ensure webhook processing
      fetchSubscription();

      // Clean up URL parameters immediately
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Retry subscription fetch multiple times to catch webhook updates
      const retryIntervals = [2000, 5000, 10000];
      retryIntervals.forEach((delay) => {
        setTimeout(() => {
          console.log(`[PAYMENT_SUCCESS] Retrying subscription fetch after ${delay}ms`);
          fetchSubscription();
        }, delay);
      });
    }
  }, []); // Removed dependencies to prevent re-runs
};