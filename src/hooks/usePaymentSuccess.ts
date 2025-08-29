import { useEffect, useState } from 'react';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentSuccess = (siteId?: string) => {
  const { fetchSubscription } = useSubscription();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayment = async (sessionId: string, siteId?: string) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    console.log('[PAYMENT_SUCCESS] Verifying payment with Stripe', { sessionId, siteId });
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId, site_id: siteId }
      });

      if (error) {
        console.error('[PAYMENT_SUCCESS] Verification error:', error);
        toast({
          title: 'Payment Verification Failed',
          description: 'There was an issue verifying your payment. Please contact support.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.success) {
        console.log('[PAYMENT_SUCCESS] Payment verified successfully', data);
        toast({
          title: '🎉 Payment Verified!',
          description: 'Your subscription has been activated successfully.',
        });
        
        // Refresh subscription data
        await fetchSubscription(siteId);
      } else {
        console.log('[PAYMENT_SUCCESS] Payment not yet completed', data);
        toast({
          title: 'Payment Processing',
          description: data.message || 'Your payment is still being processed.',
        });
      }
    } catch (error) {
      console.error('[PAYMENT_SUCCESS] Verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Failed to verify payment. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');

    if (sessionId && success === 'true') {
      console.log('[PAYMENT_SUCCESS] Payment success detected, verifying with Stripe');
      
      // Show initial success message
      toast({
        title: '🎉 Payment Successful!',
        description: 'Verifying your payment and activating subscription...',
      });

      // Verify the payment with Stripe
      verifyPayment(sessionId, siteId);

      // Clean up URL parameters immediately
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []); // Removed dependencies to prevent re-runs

  return { isVerifying };
};