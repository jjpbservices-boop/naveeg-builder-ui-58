import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Page {
  id: string;
  title: string;
  type: 'home' | 'about' | 'services' | 'gallery' | 'contact' | 'custom';
  description?: string;
  isRequired?: boolean;
  sections?: { section_title: string }[];
}

export interface OnboardingState {
  // Basic info
  business_name: string;
  business_description: string;
  business_type: string;
  
  // SEO fields (auto-generated)
  seo_title: string;
  seo_description: string;
  seo_keyphrase: string;
  
  // Design preferences
  colors: {
    primary_color: string;
    secondary_color: string;
    background_dark: string;
  };
  fonts: {
    heading: 'Syne' | 'Playfair Display' | 'Montserrat' | 'Poppins' | 'Merriweather' | 'DM Sans' | 'Karla';
    body: 'Inter' | 'Roboto' | 'Lato' | 'Open Sans' | 'Source Sans 3' | 'Noto Sans';
  };
  
  // Site structure
  pages_meta: Page[];
  website_type: 'basic' | 'ecommerce';
  
  // API response data
  website_id?: number;
  unique_id?: string;
  preview_url?: string;
  admin_url?: string;
  
  // UI state
  currentStep: number;
  isLoading: boolean;
  error?: string;
}

export interface OnboardingActions {
  // Update methods
  updateBasicInfo: (info: Partial<Pick<OnboardingState, 'business_type' | 'business_name' | 'business_description'>>) => void;
  updateSEO: (seo: Partial<Pick<OnboardingState, 'seo_title' | 'seo_description' | 'seo_keyphrase'>>) => void;
  updateDesign: (design: Partial<Pick<OnboardingState, 'colors' | 'fonts'>>) => void;
  updatePages: (pages: Page[]) => void;
  updateWebsiteType: (type: 'basic' | 'ecommerce') => void;
  updateApiData: (data: Partial<Pick<OnboardingState, 'website_id' | 'unique_id' | 'preview_url' | 'admin_url'>>) => void;
  
  // Page management
  addPage: (page: Page) => void;
  removePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  
  // Flow control
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  // Reset
  reset: () => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
  business_name: '',
  business_description: '',
  business_type: 'basic',
  seo_title: '',
  seo_description: '',
  seo_keyphrase: '',
  colors: {
    primary_color: '#FF4A1C',
    secondary_color: '#6B7280', 
    background_dark: '#000000',
  },
  fonts: {
    heading: 'Poppins',
    body: 'Inter',
  },
  pages_meta: [
    { id: '1', title: 'Home', type: 'home', isRequired: true, sections: [] },
    { id: '2', title: 'About', type: 'about', isRequired: true, sections: [] },
    { id: '3', title: 'Services', type: 'services', isRequired: true, sections: [] },
    { id: '4', title: 'Contact', type: 'contact', isRequired: true, sections: [] },
  ],
  website_type: 'basic',
  currentStep: 0,
  isLoading: false,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      updateBasicInfo: (info) => 
        set((state) => ({ ...state, ...info })),
      
      updateSEO: (seo) => 
        set((state) => ({ ...state, ...seo })),
      
      updateDesign: (design) => 
        set((state) => ({ 
          ...state, 
          colors: design.colors ? { ...state.colors, ...design.colors } : state.colors,
          fonts: design.fonts ? { ...state.fonts, ...design.fonts } : state.fonts,
        })),
      
      updatePages: (pages) => 
        set({ pages_meta: pages }),
      
      updateWebsiteType: (website_type) => 
        set({ website_type }),
      
      updateApiData: (data) => 
        set((state) => ({ ...state, ...data })),
      
      addPage: (page) => 
        set((state) => ({ 
          pages_meta: [...state.pages_meta, page] 
        })),
      
      removePage: (pageId) => 
        set((state) => ({ 
          pages_meta: state.pages_meta.filter(p => p.id !== pageId && !p.isRequired) 
        })),
      
      updatePage: (pageId, updates) => 
        set((state) => ({ 
          pages_meta: state.pages_meta.map(p => 
            p.id === pageId ? { ...p, ...updates } : p
          ) 
        })),
      
      setCurrentStep: (currentStep) => 
        set({ currentStep }),
      
      nextStep: () => 
        set((state) => ({ currentStep: state.currentStep + 1 })),
      
      prevStep: () => 
        set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setError: (error) => 
        set({ error }),
      
      reset: () => 
        set(initialState),
    }),
    {
      name: 'onboarding-store',
      partialize: (state) => ({
        business_type: state.business_type,
        business_name: state.business_name,
        business_description: state.business_description,
        seo_title: state.seo_title,
        seo_description: state.seo_description,
        seo_keyphrase: state.seo_keyphrase,
        colors: state.colors,
        fonts: state.fonts,
        pages_meta: state.pages_meta,
        website_type: state.website_type,
        website_id: state.website_id,
        unique_id: state.unique_id,
        preview_url: state.preview_url,
        admin_url: state.admin_url,
        currentStep: state.currentStep,
      }),
    }
  )
);