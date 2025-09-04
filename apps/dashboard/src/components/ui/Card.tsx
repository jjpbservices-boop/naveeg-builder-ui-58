import React from 'react';

interface CardProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function Card({ title, actions, children }: CardProps) {
  return (
    <section className="rounded-xl border border-n200 bg-surface shadow-[0_20px_60px_rgba(10,12,16,.10)]">
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-n200">
          {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
