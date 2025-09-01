'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Home, Settings, CreditCard, BarChart3, ChevronLeft, ChevronRight, ChevronDown, Crown,
  Edit3, Play, Check, CheckCircle, ExternalLink, Globe, Eye, Search, Zap,
  Loader2, Bot, Building2, Building, Rocket, TrendingUp, TrendingDown, ServerCog,
  AlertCircle, ArrowLeft, ArrowRight, Download, LogOut, Trash2, X,
  PanelsTopLeft, Globe2, KeyRound, Star, Info
} from 'lucide-react';

const ICONS = {
  home: Home,
  settings: Settings,
  'credit-card': CreditCard,
  'bar-chart-3': BarChart3,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  crown: Crown,
  'edit-3': Edit3,
  play: Play,
  check: Check,
  'check-circle': CheckCircle,
  'external-link': ExternalLink,
  globe: Globe,
  eye: Eye,
  search: Search,
  zap: Zap,
  'loader-2': Loader2,
  bot: Bot,
  building: Building,
  building2: Building2,
  'building-2': Building2,
  rocket: Rocket,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'server-cog': ServerCog,
  'alert-circle': AlertCircle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  download: Download,
  'log-out': LogOut,
  'trash-2': Trash2,
  x: X,
  'panels-top-left': PanelsTopLeft,
  globe2: Globe2,
  'key-round': KeyRound,
  star: Star,
  info: Info,
} as const;

export type IconName = keyof typeof ICONS;

export function IconInner({
  name,
  className,
  ...rest
}: { name: IconName; className?: string } & React.SVGProps<SVGSVGElement>) {
  const C: LucideIcon | undefined = ICONS[name];
  if (!C) {
    // deterministic fallback (same on server & client)
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        data-fallback
        {...rest}
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  }
  return <C className={className} aria-hidden="true" {...rest} />;
}
