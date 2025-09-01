'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          siteName={siteName}
          plan={plan}
          domain={domain}
          status={status}
        />
        
        {/* Page content */}
        <main className={cn('flex-1 overflow-auto p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
