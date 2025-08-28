import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanType = 'trial' | 'starter' | 'pro' | 'custom';

export interface PlanFeatures {
  pages: number | 'unlimited';
  ai_content: boolean;
  advanced_design: boolean;
  full_seo: boolean;
  analytics_advanced: boolean;
  backups_self_restore: boolean;
  security_advanced: boolean;
  store: boolean;
  forms_advanced: boolean;
  automations: boolean;
  integrations_advanced: boolean;
  support_level: 'docs' | 'chat' | 'dedicated';
  domains: number | 'unlimited';
  staging: boolean;
  multisite: boolean;
}

export interface PlanState {
  currentPlan: PlanType;
  trialDaysLeft: number;
  trialStartDate: Date | null;
  features: PlanFeatures;
  isTrialExpired: boolean;
}

export interface PlanActions {
  setPlan: (plan: PlanType) => void;
  setTrialDaysLeft: (days: number) => void;
  startTrial: () => void;
  checkTrialExpiry: () => void;
  getFeatures: () => PlanFeatures;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  canAccessFeature: (feature: keyof PlanFeatures) => boolean;
}

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  trial: {
    pages: 'unlimited',
    ai_content: true,
    advanced_design: true,
    full_seo: true,
    analytics_advanced: true,
    backups_self_restore: true,
    security_advanced: true,
    store: true,
    forms_advanced: true,
    automations: true,
    integrations_advanced: true,
    support_level: 'chat',
    domains: 0, // Domain connection disabled during trial
    staging: true,
    multisite: false,
  },
  starter: {
    pages: 5,
    ai_content: false,
    advanced_design: false,
    full_seo: false,
    analytics_advanced: false,
    backups_self_restore: false,
    security_advanced: false,
    store: false,
    forms_advanced: false,
    automations: false,
    integrations_advanced: false,
    support_level: 'docs',
    domains: 1,
    staging: false,
    multisite: false,
  },
  pro: {
    pages: 'unlimited',
    ai_content: true,
    advanced_design: true,
    full_seo: true,
    analytics_advanced: true,
    backups_self_restore: true,
    security_advanced: true,
    store: true,
    forms_advanced: true,
    automations: true,
    integrations_advanced: true,
    support_level: 'chat',
    domains: 'unlimited',
    staging: true,
    multisite: false,
  },
  custom: {
    pages: 'unlimited',
    ai_content: true,
    advanced_design: true,
    full_seo: true,
    analytics_advanced: true,
    backups_self_restore: true,
    security_advanced: true,
    store: true,
    forms_advanced: true,
    automations: true,
    integrations_advanced: true,
    support_level: 'dedicated',
    domains: 'unlimited',
    staging: true,
    multisite: true,
  },
};

export const usePlanStore = create<PlanState & PlanActions>()(
  persist(
    (set, get) => ({
      currentPlan: 'trial',
      trialDaysLeft: 7,
      trialStartDate: new Date(),
      features: PLAN_FEATURES.trial,
      isTrialExpired: false,

      setPlan: (plan: PlanType) =>
        set({
          currentPlan: plan,
          features: PLAN_FEATURES[plan],
          isTrialExpired: false,
        }),

      setTrialDaysLeft: (days: number) =>
        set({ trialDaysLeft: days, isTrialExpired: days <= 0 }),

      startTrial: () =>
        set({
          currentPlan: 'trial',
          trialDaysLeft: 7,
          trialStartDate: new Date(),
          features: PLAN_FEATURES.trial,
          isTrialExpired: false,
        }),

      checkTrialExpiry: () => {
        const state = get();
        if (state.currentPlan === 'trial' && state.trialStartDate) {
          const now = new Date();
          const trialStart = new Date(state.trialStartDate);
          const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, 7 - daysPassed);
          
          set({
            trialDaysLeft: daysLeft,
            isTrialExpired: daysLeft <= 0,
          });
        }
      },

      getFeatures: () => get().features,

      hasFeature: (feature: keyof PlanFeatures) => {
        const features = get().features;
        return !!features[feature];
      },

      canAccessFeature: (feature: keyof PlanFeatures) => {
        const state = get();
        if (state.isTrialExpired) return false;
        return state.hasFeature(feature);
      },
    }),
    {
      name: 'plan-storage',
    }
  )
);