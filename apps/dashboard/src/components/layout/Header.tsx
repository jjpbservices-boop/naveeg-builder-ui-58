import React from 'react';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  siteName: string;
  plan: string;
  status: string;
}

export function Header({ siteName, plan, status }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">{siteName}</h1>
        </div>
        <Badge tone="info">{status}</Badge>
        <Badge tone="premium">{plan}</Badge>
      </div>
      <div className="relative">
        <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-n100 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-ink-light text-sm font-medium">U</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-ink">User Name</p>
            <p className="text-xs text-muted">user@example.com</p>
          </div>
        </button>
      </div>
    </div>
  );
}
