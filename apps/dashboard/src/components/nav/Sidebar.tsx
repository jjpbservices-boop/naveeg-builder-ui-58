import React from 'react';

const EXPANDED = 248;
const COLLAPSED = 72;

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
}

export function Sidebar({ items, collapsed }: SidebarProps) {
  return (
    <nav className={`${collapsed ? `w-[${COLLAPSED}px]` : `w-[${EXPANDED}px]`} h-dvh bg-surface border-r border-n200 shadow-sm`}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mx-3 my-1 ${
            item.active ? 'bg-n100 text-ink' : 'text-n600 hover:bg-n100'
          }`}
        >
          <span className="relative grid place-items-center size-9 rounded-lg border border-n200 bg-surface overflow-visible">
            <span className="size-5 text-n500">{item.icon}</span>
            {item.active && (
              <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-accent-blue/25" />
            )}
          </span>
          <span className={collapsed ? 'sr-only' : 'text-sm font-medium'}>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
