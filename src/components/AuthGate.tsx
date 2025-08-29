import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSkeleton } from '@/components/LoadingStates';
import { Navigate } from '@tanstack/react-router';

interface AuthGateProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

export function AuthGate({ children, fallbackRoute = '/auth' }: AuthGateProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
}