'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ComputerDesktopIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { locales, type Locale, getLocaleFromPathname, getPathnameWithLocale } from '@/lib/i18n';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: HomeIcon },
  { name: 'Websites', href: '/dashboard/websites', icon: ComputerDesktopIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Domains', href: '/dashboard/domains', icon: GlobeAltIcon },
  { name: 'Backups', href: '/dashboard/backups', icon: CloudArrowUpIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
  { name: 'Help', href: '/dashboard/help', icon: QuestionMarkCircleIcon },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  const handleLocaleChange = (newLocale: Locale) => {
    const newPath = getPathnameWithLocale(pathname, newLocale);
    window.location.href = newPath;
  };

  return (
    <div className="min-h-screen bg-[var(--wash-2)]">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--border)]">
              <span className="text-2xl font-bold text-[var(--text)]">Naveeg</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)]"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6 px-3">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pathname === item.href
                          ? 'bg-[var(--accent-grad)] text-white'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--wash-1)]'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-[var(--border)] px-6 py-4">
          <div className="flex h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-[var(--text)]">
              Naveeg
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-[var(--accent-grad)] text-white'
                        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--wash-1)]'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--border)] bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-[var(--muted)] lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Site switcher placeholder */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="text-sm font-medium text-[var(--text)]">
                My Website
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div className="text-sm text-[var(--muted)]">
                naveeg-site.naveeg.app
              </div>
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Language switcher */}
            <select
              value={currentLocale}
              onChange={(e) => handleLocaleChange(e.target.value as Locale)}
              className="text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {Object.entries(locales).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>

            {/* User menu placeholder */}
            <div className="flex items-center gap-x-4">
              <div className="w-8 h-8 bg-[var(--accent-grad)] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-[var(--text)]">User</div>
                <div className="text-xs text-[var(--muted)]">user@example.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
