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

      // Wait a moment for Stripe webhook processing, then refresh subscription
      setTimeout(() => {
        fetchSubscription();
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }, 2000);
    }
  }, [fetchSubscription, toast]);
};