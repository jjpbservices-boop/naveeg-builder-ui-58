import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { Website, Plan, Subscription } from '@/lib/api/types';

export interface BusinessBrief {
  businessName: string;
  businessType: 'informational' | 'ecommerce' | 'restaurant' | 'services' | 'portfolio' | 'blog' | '';
  businessDescription: string;
  websiteTitle: string;
  websiteDescription: string;
  websiteKeyphrase: string;
}

export interface DesignPreferences {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkBackground: boolean;
  headingFont: 'syne' | 'playfair' | 'montserrat';
  bodyFont: 'inter' | 'lato' | 'roboto';
}

interface AppState {
  // Auth state
  user: User | null;
  session: Session | null;
  authLoading: boolean;

  // Current website
  currentWebsite: Website | null;
  websites: Website[];
  websitesLoading: boolean;

  // Current subscription and plan
  currentPlan: Plan | null;
  currentSubscription: Subscription | null;
  subscriptionLoading: boolean;

  // Wizard state
  brief: BusinessBrief;
  design: DesignPreferences;

  // Actions
  setAuth: (user: User | null, session: Session | null) => void;
  setAuthLoading: (loading: boolean) => void;
  
  setCurrentWebsite: (website: Website | null) => void;
  setWebsites: (websites: Website[]) => void;
  setWebsitesLoading: (loading: boolean) => void;
  
  setCurrentPlan: (plan: Plan | null) => void;
  setCurrentSubscription: (subscription: Subscription | null) => void;
  setSubscriptionLoading: (loading: boolean) => void;
  
  updateBrief: (brief: Partial<BusinessBrief>) => void;
  updateDesign: (design: Partial<DesignPreferences>) => void;
  resetWizard: () => void;
}

const initialBrief: BusinessBrief = {
  businessName: '',
  businessType: '',
  businessDescription: '',
  websiteTitle: '',
  websiteDescription: '',
  websiteKeyphrase: '',
};

const initialDesign: DesignPreferences = {
  primaryColor: '#FF7A00',
  secondaryColor: '#6B7280',
  accentColor: '#10B981',
  darkBackground: false,
  headingFont: 'syne',
  bodyFont: 'inter',
};

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    session: null,
    authLoading: true,
    
    currentWebsite: null,
    websites: [],
    websitesLoading: false,
    
    currentPlan: null,
    currentSubscription: null,
    subscriptionLoading: false,
    
    brief: initialBrief,
    design: initialDesign,

    // Actions
    setAuth: (user, session) => {
      set({ user, session, authLoading: false });
    },
    
    setAuthLoading: (authLoading) => {
      set({ authLoading });
    },
    
    setCurrentWebsite: (currentWebsite) => {
      set({ currentWebsite });
    },
    
    setWebsites: (websites) => {
      set({ websites });
      // Auto-select first website if none selected
      const { currentWebsite } = get();
      if (!currentWebsite && websites.length > 0) {
        set({ currentWebsite: websites[0] });
      }
    },
    
    setWebsitesLoading: (websitesLoading) => {
      set({ websitesLoading });
    },
    
    setCurrentPlan: (currentPlan) => {
      set({ currentPlan });
    },
    
    setCurrentSubscription: (currentSubscription) => {
      set({ currentSubscription });
    },
    
    setSubscriptionLoading: (subscriptionLoading) => {
      set({ subscriptionLoading });
    },
    
    updateBrief: (briefUpdate) => {
      set((state) => ({
        brief: { ...state.brief, ...briefUpdate },
      }));
    },
    
    updateDesign: (designUpdate) => {
      set((state) => ({
        design: { ...state.design, ...designUpdate },
      }));
    },
    
    resetWizard: () => {
      set({
        brief: initialBrief,
        design: initialDesign,
      });
    },
  }))
);