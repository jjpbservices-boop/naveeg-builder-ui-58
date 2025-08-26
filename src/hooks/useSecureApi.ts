import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useSecureApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const { handleError } = useErrorHandler();

  const execute = useCallback(async (
    apiCall: () => Promise<{ data: T | null; error: any }>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
      showErrorToast?: boolean;
    } = {}
  ) => {
    const { onSuccess, onError, showErrorToast = true } = options;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await apiCall();
      
      if (error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        
        if (showErrorToast) {
          handleError(errorMessage);
        }
        
        onError?.(error);
        return { data: null, error };
      }

      setState(prev => ({ ...prev, loading: false, data, error: null }));
      onSuccess?.(data);
      return { data, error: null };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (showErrorToast) {
        handleError(errorMessage);
      }
      
      onError?.(err);
      return { data: null, error: err };
    }
  }, [handleError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Helper hook for authenticated user checks
export const useAuthCheck = () => {
  const { handleError } = useErrorHandler();

  const requireAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      handleError('Authentication required. Please sign in to continue.', {
        title: 'Authentication Required'
      });
      return false;
    }
    
    return true;
  }, [handleError]);

  return { requireAuth };
};