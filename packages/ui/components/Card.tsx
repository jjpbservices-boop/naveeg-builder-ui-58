'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  actions?: ReactNode;
  gradient?: 'green' | 'blue' | 'purple' | 'none';
  shadow?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children,
  className,
  header,
  actions,
  gradient = 'none',
  shadow = 'sm',
  padding = 'md',
  hover = false,
}: CardProps) {
  const gradientClasses = {
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    purple: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200',
    none: 'bg-white border-gray-200',
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, scale: 1.02 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        'rounded-2xl border transition-all duration-300 backdrop-blur-sm',
        gradientClasses[gradient],
        shadowClasses[shadow],
        paddingClasses[padding],
        hover && 'hover:shadow-xl hover:shadow-blue-500/10',
        'relative overflow-hidden',
        className
      )}
    >
      {header && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">{header}</div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
