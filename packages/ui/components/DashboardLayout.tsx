'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { cn } from '../utils';

interface DashboardLayoutProps {
  children: ReactNode;
  siteName?: string;
  plan?: string;
  domain?: string;
  status?: 'draft' | 'online' | 'generating';
  className?: string;
}

export function DashboardLayout({
  children,
  siteName,
  plan,
  domain,
  status,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          siteName={siteName}
          plan={plan}
          domain={domain}
          status={status}
        />
        
        {/* Page content */}
        <main className={cn('flex-1 overflow-auto p-6 max-w-full', className)}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
