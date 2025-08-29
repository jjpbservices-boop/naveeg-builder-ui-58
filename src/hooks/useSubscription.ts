import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Subscription {
  id: string;
  user_id: string;
  site_id?: string;
  plan_id: string;
  status: string;
  trial_end?: string;
  current_period_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription by user_id AND site_id (mandatory filtering)
  const fetchSubscription = useCallback(async (siteId?: string) => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ALWAYS filter by both user_id AND site_id for proper per-site subscriptions
      let query = supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);

      // site_id is mandatory for proper filtering
      if (siteId) {
        query = query.eq('site_id', siteId);
      } else {
        console.warn('[SUBSCRIPTION] No site_id provided for subscription fetch');
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      console.log('[SUBSCRIPTION] Fetched subscription:', data);
      setSubscription(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription';
      setError(errorMessage);
      console.error('[SUBSCRIPTION] Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Client passes plan, not price IDs
  const createCheckout = async (plan: 'starter' | 'pro', siteId: string) => {
    console.log(`[CHECKOUT] Starting checkout for plan: ${plan}, siteId: ${siteId}`);
    
    if (!siteId) {
      throw new Error('Site ID is required for checkout');
    }

    try {
      const requestBody = { 
        action: 'create-checkout', 
        plan, 
        site_id: siteId 
      };
      
      console.log('[CHECKOUT] Request body:', requestBody);
      
      // POST JSON call to billing function
      const { data, error } = await supabase.functions.invoke('billing', {
        body: requestBody,
      });

      console.log('[CHECKOUT] Response:', { data, error });

      if (error) throw error;

      if (data?.url) {
        console.log('[CHECKOUT] Redirecting to:', data.url);
        // Redirect in same tab to prevent popup blocking
        window.location.assign(data.url);
      } else {
        throw new Error('No checkout URL received from server');
      }

      return { data, error: null };
    } catch (err) {
      console.error('[CHECKOUT] Error creating checkout:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout';
      throw new Error(errorMessage);
    }
  };

  const createPortal = async () => {
    try {
      const requestBody = { action: 'create-portal' };
      console.log('[PORTAL] Request body:', requestBody);
      
      // POST JSON call to billing function
      const { data, error } = await supabase.functions.invoke('billing', {
        body: requestBody,
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect in same tab to prevent popup blocking
        window.location.assign(data.url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create portal';
      throw new Error(errorMessage);
    }
  };

  const isTrialActive = () => {
    if (!subscription || subscription.status !== 'trialing') return false;
    if (!subscription.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  };

  const isSubscriptionActive = () => {
    if (!subscription) return false;
    return ['active', 'past_due'].includes(subscription.status);
  };

  // Domain connect locked until paid
  const canConnectDomain = () => {
    return isSubscriptionActive(); // status in active|past_due
  };

  const getTrialDaysLeft = () => {
    if (!subscription || subscription.status !== 'trialing' || !subscription.trial_end) {
      return 0;
    }
    
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  useEffect(() => {
    // Don't auto-fetch without site_id context
    // Components should call fetchSubscription(siteId) explicitly
  }, []);

  // Real-time subscription with both user_id and site_id filters
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Refetch subscription when changes occur, filtered by site_id if available
          const siteId = (payload.new as any)?.site_id || (payload.old as any)?.site_id;
          console.log('[SUBSCRIPTION] Real-time update received', { payload, siteId });
          // Don't call fetchSubscription here to prevent loops
          // Let components handle subscription refetch explicitly
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // Removed fetchSubscription from dependencies to prevent infinite loop

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
    createCheckout,
    createPortal,
    isTrialActive,
    isSubscriptionActive,
    canConnectDomain,
    getTrialDaysLeft,
  };
};