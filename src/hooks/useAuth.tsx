import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Track last session to prevent duplicate events
  const lastSessionRef = useRef<Session | null>(null);
  const lastEventRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('[AUTH] Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH] Auth state changed:', event, !!session, session?.user?.id);
        
        // Compare sessions to prevent unnecessary updates
        const sessionChanged = lastSessionRef.current?.user?.id !== session?.user?.id;
        const eventChanged = lastEventRef.current !== event;
        
        if (!sessionChanged && !eventChanged) {
          console.log('[AUTH] Ignoring duplicate auth event');
          return;
        }
        
        // Update refs
        lastSessionRef.current = session;
        lastEventRef.current = event;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Rate-limit toast notifications to prevent spam
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }

        // Handle auth events with debouncing
        if (event === 'SIGNED_IN' && sessionChanged) {
          toastTimeoutRef.current = setTimeout(() => {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          toastTimeoutRef.current = setTimeout(() => {
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
            });
          }, 500);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Initial session check:', !!session, session?.user?.id);
      lastSessionRef.current = session;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('[AUTH] Cleaning up auth listener');
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created successfully",
          description: "You are now signed in.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset email sent",
          description: "Check your email for the reset link.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};