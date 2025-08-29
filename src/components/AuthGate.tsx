import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, User as UserIcon } from 'lucide-react';
import { HeroAnimation } from '@/components/HeroAnimation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGateProps {
  children: React.ReactNode;
  redirectTo?: string;
  message?: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({ 
  children, 
  redirectTo = '/auth',
  message = 'Sign in to continue accessing this feature'
}) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleSignIn = () => {
    navigate({ to: redirectTo });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
        <HeroAnimation />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-muted backdrop-blur-sm border shadow-soft">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {message}
              </p>
              <Button 
                onClick={handleSignIn}
                className="w-full"
                size="lg"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};