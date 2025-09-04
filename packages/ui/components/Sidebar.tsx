'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, type IconName } from './Icon';
import { cn } from '../utils';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  description: string;
}

const navItems: NavItem[] = [
  {
    href: '/app/overview',
    label: 'Overview',
    icon: 'home',
    description: 'Dashboard overview and quick actions',
  },
  {
    href: '/app/analytics',
    label: 'Analytics',
    icon: 'bar-chart-3',
    description: 'Performance metrics and insights',
  },
  {
    href: '/app/pages',
    label: 'Pages & Content',
    icon: 'file-text',
    description: 'Manage your website pages',
  },
  {
    href: '/app/domains',
    label: 'Domains & Security',
    icon: 'shield',
    description: 'Domain and security settings',
  },
  {
    href: '/app/billing',
    label: 'Billing',
    icon: 'credit-card',
    description: 'Manage your subscription',
  },
  {
    href: '/app/settings',
    label: 'Settings',
    icon: 'settings',
    description: 'Account and preferences',
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleCollapsed();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  const showExpanded = isCollapsed && isHovered;

  return (
    <motion.div
      className={cn(
        'relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.h1
              key="title"
              className="text-xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Naveeg
            </motion.h1>
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleCollapsed}
          className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={isCollapsed ? 'chevron-right' : 'chevron-left'}
            className="w-4 h-4 text-gray-600"
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            showExpanded={showExpanded}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="user-info"
                className="min-w-0 flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  User Name
                </p>
                <p className="text-xs text-gray-500 truncate">
                  user@example.com
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
  showExpanded: boolean;
}

function SidebarItem({ item, isCollapsed, showExpanded }: SidebarItemProps) {
  // Note: Active state should be determined by the parent component
  const isActive = false; // TODO: Pass active state as prop
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <a
        href={item.href}
        className={cn(
          'flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group',
          'hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isActive && 'bg-blue-100 text-blue-700 shadow-sm'
        )}
        aria-current={isActive ? 'page' : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon
          name={item.icon}
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-colors',
            isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
          )}
        />
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              key="label"
              className="text-sm font-medium transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </a>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {isCollapsed && isHovered && (
          <motion.div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {item.label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-gray-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
