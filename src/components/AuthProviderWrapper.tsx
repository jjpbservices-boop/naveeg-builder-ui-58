import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/stores/useAppStore';
import { getSupabaseClient } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';

interface AuthProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Enhanced AuthProvider that integrates with the new Zustand store
 * and automatically syncs auth state with the centralized store
 */
export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  const { user, session, loading } = useAuth();
  const { setAuth, setAuthLoading } = useAppStore();
  const { toast } = useToast();

  // Sync auth state with store
  useEffect(() => {
    setAuth(user, session);
    setAuthLoading(loading);
  }, [user, session, loading, setAuth, setAuthLoading]);

  // Auto-fetch user's websites when authenticated
  useEffect(() => {
    if (user && !loading) {
      fetchUserWebsites();
    }
  }, [user, loading]);

  const fetchUserWebsites = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseClient();
      const { data: websites, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your websites',
          variant: 'destructive',
        });
        return;
      }

      useAppStore.getState().setWebsites(websites || []);
    } catch (error) {
      console.error('Error in fetchUserWebsites:', error);
    }
  };

  return <>{children}</>;
}