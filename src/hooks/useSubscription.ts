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

  const fetchSubscription = useCallback(async (siteId?: string) => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);

      // Filter by site_id if provided
      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setSubscription(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription';
      setError(errorMessage);
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCheckout = async (priceId: string, siteId?: string) => {
    try {
      const queryParams = new URLSearchParams({
        action: 'create-checkout',
        price_id: priceId,
        ...(siteId && { site_id: siteId }),
      });

      const { data, error } = await supabase.functions.invoke('billing?' + queryParams.toString(), {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open checkout in new tab
        window.open(data.url, '_blank');
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout';
      return { data: null, error: errorMessage };
    }
  };

  const createPortal = async (customerId?: string) => {
    try {
      const queryParams = new URLSearchParams({
        action: 'create-portal',
        ...(customerId && { customer_id: customerId }),
      });

      const { data, error } = await supabase.functions.invoke('billing?' + queryParams.toString(), {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open portal in new tab
        window.open(data.url, '_blank');
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create portal';
      return { data: null, error: errorMessage };
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

  const canConnectDomain = () => {
    return isSubscriptionActive();
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
    fetchSubscription();
  }, [fetchSubscription]);

  // Set up real-time subscription for subscription changes
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
          // Refetch subscription when changes occur
          const siteId = (payload.new as any)?.site_id || (payload.old as any)?.site_id;
          fetchSubscription(siteId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSubscription]);

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