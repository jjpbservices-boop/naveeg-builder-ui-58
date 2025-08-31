import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useAppStore } from '@/lib/stores/useAppStore';

// Simplified context for pages that still need migration
interface AppContextType {
  state: {
    brief: any;
    design: any;
    websiteMeta: any;
    analytics: any;
  };
  dispatch: React.Dispatch<any>;
  resetWizard: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Bridge to new store
  const store = useAppStore();
  
  const context = {
    state: {
      brief: store.brief,
      design: store.design,
      websiteMeta: null,
      analytics: { visitors: 0, pageViews: 0, bounceRate: 0, timeOnSite: 0 },
    },
    dispatch: () => {}, // Deprecated, use store actions
    resetWizard: store.resetWizard,
  };

  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  );
}

// Legacy hook for compatibility
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}