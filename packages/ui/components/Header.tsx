'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { cn } from '../utils';

interface HeaderProps {
  siteName?: string;
  plan?: string;
  domain?: string;
  status?: 'draft' | 'online' | 'generating';
  className?: string;
}

export function Header({ siteName, plan, domain, status, className }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'custom':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <header className={cn('sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm', className)}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Site info */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 font-sans">
              {siteName || 'My Website'}
            </h1>
            {domain && (
              <p className="text-sm text-gray-500">
                {domain}
              </p>
            )}
          </div>
          
          {/* Status badge */}
          {status && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(status)
            )}>
              <Icon
                name={status === 'online' ? 'check-circle' : status === 'generating' ? 'loader-2' : 'edit-3'}
                className="w-3 h-3 mr-1"
              />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
          
          {/* Plan badge */}
          {plan && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getPlanColor(plan)
            )}>
              <Icon
                name="crown"
                className="w-3 h-3 mr-1"
              />
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          )}
        </div>

        {/* Right side - User menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">User Name</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
            <Icon
              name="chevron-down"
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform duration-200',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* User dropdown menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <a
                  href="/app/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Icon name="settings" className="w-4 h-4 mr-3 text-gray-400" />
                  Settings
                </a>
                <a
                  href="/app/billing"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Icon name="credit-card" className="w-4 h-4 mr-3 text-gray-400" />
                  Billing
                </a>
                <div className="border-t border-gray-200 my-1" />
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    // TODO: Implement sign out
                    console.log('Sign out clicked');
                  }}
                >
                  <Icon name="log-out" className="w-4 h-4 mr-3 text-gray-400" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
