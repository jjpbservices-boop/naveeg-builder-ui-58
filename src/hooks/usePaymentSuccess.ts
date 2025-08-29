import { useEffect, useState } from 'react';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentSuccess = (siteId?: string) => {
  const { fetchSubscription } = useSubscription();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<{sessionId: string, siteId?: string} | null>(null);

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
        
        // Refresh subscription data - handle undefined siteId gracefully
        console.log('[PAYMENT_SUCCESS] Refreshing subscription with siteId:', siteId);
        await fetchSubscription(siteId);
        
        // Add a small delay and refresh again to ensure UI updates
        setTimeout(async () => {
          console.log('[PAYMENT_SUCCESS] Secondary refresh for UI consistency');
          await fetchSubscription(siteId);
        }, 1000);
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

  // Effect to detect payment success and store verification details
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');

    if (sessionId && success === 'true') {
      console.log('[PAYMENT_SUCCESS] Payment success detected, waiting for user authentication');
      
      // Show initial success message
      toast({
        title: '🎉 Payment Successful!',
        description: 'Verifying your payment and activating subscription...',
      });

      // Store verification details to process when user is authenticated
      setPendingVerification({ sessionId, siteId });

      // Clean up URL parameters immediately
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []); // Run only once on mount

  // Effect to verify payment when user is authenticated and verification is pending
  useEffect(() => {
    if (!loading && user && pendingVerification) {
      console.log('[PAYMENT_SUCCESS] User authenticated, proceeding with payment verification');
      verifyPayment(pendingVerification.sessionId, pendingVerification.siteId);
      setPendingVerification(null);
    }
  }, [loading, user, pendingVerification]); // Watch for auth state changes

  return { isVerifying };
};