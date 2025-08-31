import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

type Plan = 'starter' | 'pro' | 'custom'
type Status = 'trialing' | 'active' | 'past_due' | 'canceled'

export type Subscription = {
  id: string
  user_id: string
  site_id: string | null
  plan_id: Plan
  status: Status
  current_period_end: string | null
  trial_end?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at?: string
}

const getEffectivePlan = (s: Subscription | null): 'trial' | 'starter' | 'pro' | 'custom' =>
  s && s.status === 'active' ? s.plan_id : 'trial'

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchSubscription = useCallback(async (siteId?: string) => {
    setLoading(true)
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { 
      setSubscription(null)
      setLoading(false)
      return
    }

    let q = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (siteId) q = q.eq('site_id', siteId)

    const { data, error } = await q
    if (error) console.error('[SUBSCRIPTION] fetch error', error)
    
    // Always create new reference to ensure React re-renders
    const newSubscription = data?.[0] ? {
      ...(data[0] as any),
      plan_id: (data[0] as any).plan_id as Plan,
      status: (data[0] as any).status as Status
    } : null
    setSubscription(newSubscription)
    setLoading(false)
  }, [])

  // Auto-fetch once user is known
  useEffect(() => { 
    fetchSubscription() 
  }, [fetchSubscription])

  // Realtime push on any change to this user's subscriptions
  useEffect(() => {
    let channel: any
    const supabase = getSupabase()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      channel = supabase
        .channel('subs')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          console.log('[SUBSCRIPTION] Real-time update:', payload)
          const newSub = payload.new && typeof payload.new === 'object' ? {
            ...payload.new,
            plan_id: (payload.new as any).plan_id as Plan,
            status: (payload.new as any).status as Status
          } : null
          setSubscription(newSub as Subscription)
        })
        .subscribe()
    })
    return () => { 
      const supabase = getSupabase()
      if (channel) supabase.removeChannel(channel) 
    }
  }, [])

  // Legacy methods for compatibility
  const createCheckout = async (plan: 'starter' | 'pro', siteId: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.functions.invoke('billing', {
      body: { action: 'create-checkout', plan, site_id: siteId }
    })
    if (error) throw error
    if (data?.url) window.location.assign(data.url)
    return { data, error: null }
  }

  const createPortal = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase.functions.invoke('billing', {
      body: { action: 'create-portal' }
    })
    if (error) throw error
    if (data?.url) window.location.assign(data.url)
  }

  const syncSubscription = async (siteId?: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.functions.invoke('sync-subscription', {
      body: { site_id: siteId }
    })
    if (error) throw error
    await fetchSubscription(siteId)
    return data
  }

  return {
    subscription,
    plan: getEffectivePlan(subscription),
    isActive: subscription?.status === 'active',
    loading,
    fetchSubscription,
    createCheckout,
    createPortal,
    syncSubscription,
    // Legacy compatibility
    isSubscriptionActive: () => subscription?.status === 'active',
    isTrialActive: () => subscription?.status === 'trialing' && subscription?.trial_end && new Date(subscription.trial_end) > new Date(),
    canConnectDomain: () => subscription?.status === 'active',
    getTrialDaysLeft: () => {
      if (!subscription?.trial_end) return 0
      const days = Math.ceil((new Date(subscription.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(0, days)
    }
  }
}