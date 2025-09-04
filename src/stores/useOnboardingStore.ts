import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SitemapNode = {
  id: string;
  title: string;
  kind: 'page' | 'category';
  children?: SitemapNode[];
};

export type OnboardingState = {
  siteId?: string;
  jobId?: string;
  business: { 
    name: string; 
    description: string; 
    type: 'basic' | 'ecommerce' 
  };
  seo: { 
    title: string; 
    description: string; 
    keyphrase: string 
  };
  sitemap: SitemapNode[];
  theme: { 
    primary: string; 
    secondary: string; 
    darkBg: string; 
    font: string 
  };
  currentStep: number;
  isPolling: boolean;
  progressMessage: string;
};

export type OnboardingActions = {
  setSiteId: (siteId: string) => void;
  setJobId: (jobId: string) => void;
  setBusiness: (business: Partial<OnboardingState['business']>) => void;
  setSeo: (seo: Partial<OnboardingState['seo']>) => void;
  setSitemap: (sitemap: SitemapNode[]) => void;
  setTheme: (theme: Partial<OnboardingState['theme']>) => void;
  setCurrentStep: (step: number) => void;
  setIsPolling: (isPolling: boolean) => void;
  setProgressMessage: (message: string) => void;
  reset: () => void;
};

const initialState: OnboardingState = {
  business: { name: '', description: '', type: 'basic' },
  seo: { title: '', description: '', keyphrase: '' },
  sitemap: [],
  theme: { primary: '#3B82F6', secondary: '#10B981', darkBg: '#1F2937', font: 'Inter' },
  currentStep: 0,
  isPolling: false,
  progressMessage: '',
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSiteId: (siteId) => set({ siteId }),
      setJobId: (jobId) => set({ jobId }),
      
      setBusiness: (business) => 
        set((state) => ({ business: { ...state.business, ...business } })),
      
      setSeo: (seo) => 
        set((state) => ({ seo: { ...state.seo, ...seo } })),
      
      setSitemap: (sitemap) => set({ sitemap }),
      
      setTheme: (theme) => 
        set((state) => ({ theme: { ...state.theme, ...theme } })),
      
      setCurrentStep: (currentStep) => set({ currentStep }),
      setIsPolling: (isPolling) => set({ isPolling }),
      setProgressMessage: (progressMessage) => set({ progressMessage }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-store',
      partialize: (state) => ({
        siteId: state.siteId,
        business: state.business,
        seo: state.seo,
        sitemap: state.sitemap,
        theme: state.theme,
        currentStep: state.currentStep,
      }),
    }
  )
);
