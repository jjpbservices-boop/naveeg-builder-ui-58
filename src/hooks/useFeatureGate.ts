import { useSubscription } from './useSubscription'

export function useFeatureGate() {
  const { plan, isActive } = useSubscription()
  const effective = isActive ? plan : 'trial'
  
  return {
    canUseStore: effective === 'pro',
    canUseForms: effective === 'pro', 
    canUseAutomations: effective === 'pro',
    canUseAnalytics: effective === 'pro',
    canConnectDomain: effective !== 'trial',
    effectivePlan: effective
  }
}