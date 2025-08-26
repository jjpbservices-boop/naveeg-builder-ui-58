import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthCheck = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const requireAuth = useCallback(() => {
    if (loading) return false;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [user, loading, toast]);

  return { requireAuth, isAuthenticated: !!user, user };
};

export const useSecureApi = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { requireAuth } = useAuthCheck();

  const secureQuery = useCallback(async (queryFn: () => Promise<any>) => {
    if (!requireAuth()) return null;

    setLoading(true);
    try {
      const result = await queryFn();
      return result;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [requireAuth, toast]);

  const secureMutation = useCallback(async (
    mutationFn: () => Promise<any>,
    successMessage?: string
  ) => {
    if (!requireAuth()) return null;

    setLoading(true);
    try {
      const result = await mutationFn();
      
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [requireAuth, toast]);

  return { loading, secureQuery, secureMutation };
};