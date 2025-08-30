import { useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { useFeatureFlagsStore } from '@/stores/useFeatureFlagsStore';

export type FeatureFlags = {
  canUseStore: boolean;
  canUseForms: boolean;
  canUseAutomations: boolean;
  canUseAnalytics: boolean;
  canConnectDomain: boolean;
  canUseBackups: boolean;
  canUseStaging: boolean;
  canUseAdvancedCache: boolean;
  canUseCustomPhp: boolean;
  canUseSecurity: boolean;
  canUseAdvancedPages: boolean;
  canUseLogs: boolean;
  effectivePlan: 'trial' | 'starter' | 'pro' | 'custom';
};

export function useFeatureGate(): FeatureFlags {
  const { plan, isActive } = useSubscription();
  const { featureFlags, updateFeatureFlags } = useFeatureFlagsStore();
  
  // Calculate feature flags based on current subscription
  useEffect(() => {
    const effective = isActive ? plan : 'trial';
    
    // Feature mapping based on plan tiers
    const isStarter = effective === 'starter';
    const isPro = effective === 'pro';
    const isCustom = effective === 'custom';
    const isPaid = isStarter || isPro || isCustom;
    
    const newFlags: FeatureFlags = {
      // Core features
      canConnectDomain: isPaid,
      canUseAnalytics: isPaid,
      canUseBackups: isPaid,
      
      // Pro features
      canUseStore: isPro || isCustom,
      canUseForms: isPro || isCustom,
      canUseAutomations: isPro || isCustom,
      canUseStaging: isPro || isCustom,
      canUseAdvancedCache: isPro || isCustom,
      canUseCustomPhp: isPro || isCustom,
      canUseSecurity: isPro || isCustom,
      canUseAdvancedPages: isPro || isCustom,
      canUseLogs: isPro || isCustom,
      
      effectivePlan: effective
    };

    updateFeatureFlags(newFlags);
  }, [plan, isActive, updateFeatureFlags]);
  
  return featureFlags;
}