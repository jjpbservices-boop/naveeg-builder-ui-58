import React from 'react';

interface BadgeProps {
  tone?: 'neutral' | 'success' | 'info' | 'warning' | 'premium';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  const map = {
    neutral: 'bg-n100 text-n700',
    success: 'bg-[color:var(--n50)] text-[color:var(--n700)] ring-1 ring-[color:var(--accent-green)]/20',
    info: 'bg-[color:var(--n100)] text-n700 ring-1 ring-[color:var(--accent-blue)]/20',
    warning: 'bg-n100 text-n700',
    premium: 'bg-n100 text-n700 ring-1 ring-[color:var(--accent-purple)]/20',
  } as const;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs leading-5 font-medium ${map[tone]}`}>
      {icon && <span className="size-3.5 shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
