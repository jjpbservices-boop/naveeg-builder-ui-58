import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
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

export interface BillingProfile {
  accountType: 'individual' | 'company';
  legalName: string;
  billingEmail: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
  };
  hasVatNumber: boolean;
  vatNumber: string;
  invoicingLanguage: string;
  displayCurrency: string;
}

export interface AppState {
  brief: BusinessBrief;
  design: DesignPreferences;
  billing: BillingProfile;
  websiteMeta: {
    id: string;
    url: string;
    created: Date;
    lastModified: Date;
    status: 'active' | 'inactive' | 'maintenance';
  } | null;
  analytics: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    timeOnSite: number;
  };
}

// Initial state
const initialState: AppState = {
  brief: {
    businessName: '',
    businessType: '',
    businessDescription: '',
    websiteTitle: '',
    websiteDescription: '',
    websiteKeyphrase: '',
  },
  design: {
    primaryColor: '#FF7A00',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
    darkBackground: false,
    headingFont: 'syne',
    bodyFont: 'inter',
  },
  billing: {
    accountType: 'individual',
    legalName: '',
    billingEmail: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: '',
    },
    hasVatNumber: false,
    vatNumber: '',
    invoicingLanguage: 'en',
    displayCurrency: 'EUR',
  },
  websiteMeta: null,
  analytics: {
    visitors: 0,
    pageViews: 0,
    bounceRate: 0,
    timeOnSite: 0,
  },
};

// Action types
type AppAction =
  | { type: 'UPDATE_BRIEF'; payload: Partial<BusinessBrief> }
  | { type: 'UPDATE_DESIGN'; payload: Partial<DesignPreferences> }
  | { type: 'UPDATE_BILLING'; payload: Partial<BillingProfile> }
  | { type: 'SET_WEBSITE_META'; payload: AppState['websiteMeta'] }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<AppState['analytics']> }
  | { type: 'RESET_WIZARD' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_BRIEF':
      return {
        ...state,
        brief: { ...state.brief, ...action.payload },
      };
    case 'UPDATE_DESIGN':
      return {
        ...state,
        design: { ...state.design, ...action.payload },
      };
    case 'UPDATE_BILLING':
      return {
        ...state,
        billing: { ...state.billing, ...action.payload },
      };
    case 'SET_WEBSITE_META':
      return {
        ...state,
        websiteMeta: action.payload,
      };
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload },
      };
    case 'RESET_WIZARD':
      return {
        ...initialState,
        billing: state.billing, // Keep billing info
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  resetWizard: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const resetWizard = () => {
    dispatch({ type: 'RESET_WIZARD' });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, resetWizard }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}