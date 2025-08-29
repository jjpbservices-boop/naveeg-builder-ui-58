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
  
  // Add execution guard to prevent infinite loops
  const [isExecuting, setIsExecuting] = useState<Set<string>>(new Set());
  const [lastFetchedSiteId, setLastFetchedSiteId] = useState<string | null>(null);

  // Fetch subscription by user_id, with fallback for site_id filtering
  const fetchSubscription = useCallback(async (siteId?: string) => {
    console.log('[SUBSCRIPTION] fetchSubscription called with siteId:', siteId);
    
    if (!user) {
      console.log('[SUBSCRIPTION] No user, clearing subscription');
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Execution guard to prevent infinite loops
    const executionKey = `${user.id}-${siteId || 'no-site'}`;
    if (isExecuting.has(executionKey)) {
      console.log('[SUBSCRIPTION] Already executing for:', executionKey);
      return;
    }

    try {
      console.log('[SUBSCRIPTION] Starting fetch for:', executionKey);
      setIsExecuting(prev => new Set(prev).add(executionKey));
      setLoading(true);
      setError(null);

      // Fetch the most recent active subscription for the user
      // Priority: subscription with matching site_id, then any active subscription
      let query = supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false });

      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error: fetchError } = await query.limit(1);

      if (fetchError) {
        throw fetchError;
      }

      // If no subscription found for specific site, try without site filter as fallback
      if (!data || data.length === 0) {
        if (siteId) {
          console.log('[SUBSCRIPTION] No subscription found for site, trying fallback without site_id');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing', 'past_due'])
            .order('created_at', { ascending: false })
            .limit(1);

          if (fallbackError) {
            throw fallbackError;
          }

          console.log('[SUBSCRIPTION] Fallback subscription:', fallbackData?.[0] || null);
          setSubscription(fallbackData?.[0] || null);
        } else {
          setSubscription(null);
        }
      } else {
        console.log('[SUBSCRIPTION] Found subscription:', data[0]);
        setSubscription(data[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription';
      setError(errorMessage);
      console.error('[SUBSCRIPTION] Error fetching subscription:', err);
    } finally {
      setLoading(false);
      // Clear execution guard
      setIsExecuting(prev => {
        const newSet = new Set(prev);
        newSet.delete(executionKey);
        return newSet;
      });
      console.log('[SUBSCRIPTION] Fetch completed for:', executionKey);
    }
  }, [user, isExecuting]);

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

  // Manual subscription sync function for fixing issues
  const syncSubscription = async (siteId?: string) => {
    if (!user) return;
    
    console.log('[SUBSCRIPTION] Manual sync requested', { siteId });
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('sync-subscription', {
        body: { site_id: siteId }
      });

      if (error) {
        console.error('[SUBSCRIPTION] Sync error:', error);
        throw error;
      }

      console.log('[SUBSCRIPTION] Sync response:', data);
      
      // Refetch subscription after sync
      await fetchSubscription(siteId);
      
      return data;
    } catch (err) {
      console.error('[SUBSCRIPTION] Sync failed:', err);
      throw err;
    } finally {
      setLoading(false);
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
    syncSubscription,
    isTrialActive,
    isSubscriptionActive,
    canConnectDomain,
    getTrialDaysLeft,
  };
};