import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-n50 text-ink">
      <div className="grid grid-cols-[auto,1fr]">
        <aside className="sticky top-0 h-dvh">{sidebar}</aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-n200 bg-surface/85 backdrop-blur">
            {header}
          </header>
          <main className="px-6 md:px-8 py-6 md:py-8 max-w-[1200px]">{children}</main>
        </div>
      </div>
    </div>
  );
}
