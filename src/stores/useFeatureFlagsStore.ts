import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface FeatureFlagsState {
  featureFlags: FeatureFlags;
  updateFeatureFlags: (flags: FeatureFlags) => void;
  reset: () => void;
}

const defaultFeatureFlags: FeatureFlags = {
  canUseStore: false,
  canUseForms: false,
  canUseAutomations: false,
  canUseAnalytics: false,
  canConnectDomain: false,
  canUseBackups: false,
  canUseStaging: false,
  canUseAdvancedCache: false,
  canUseCustomPhp: false,
  canUseSecurity: false,
  canUseAdvancedPages: false,
  canUseLogs: false,
  effectivePlan: 'trial',
};

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  persist(
    (set) => ({
      featureFlags: defaultFeatureFlags,
      updateFeatureFlags: (flags: FeatureFlags) => 
        set({ featureFlags: flags }),
      reset: () => 
        set({ featureFlags: defaultFeatureFlags }),
    }),
    {
      name: 'feature-flags-store',
      partialize: (state) => ({ featureFlags: state.featureFlags }),
    }
  )
);