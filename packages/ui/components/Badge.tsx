'use client';

import { ReactNode } from 'react';
import { cn } from '../utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'draft' | 'live' | 'pro' | 'starter' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    live: 'bg-green-100 text-green-700 border-green-200',
    pro: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    starter: 'bg-blue-100 text-blue-700 border-blue-200',
    custom: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
