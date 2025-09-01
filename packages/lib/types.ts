export type Plan = 'starter' | 'pro' | 'custom'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: Plan
  created_at: string
}

export interface Site {
  id: string
  owner: string
  domain: string | null
  status: 'generating' | 'online' | 'draft'
  brand_vibe: string
  industry: string
  goal: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_price_id: string
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid'
  current_period_end: string
}

export interface AnalyticsSnapshot {
  id: string
  site_id: string
  source: 'psi' | '10web'
  lcp: number
  cls: number
  inp: number
  performance: number
  pagespeed_raw: any
  created_at: string
}

export interface PSIMetrics {
  lcp: number
  cls: number
  inp: number
  performance: number
  url: string
  strategy: 'mobile' | 'desktop'
}

export type Section = { section_title: string; section_description?: string };
export type PageMeta = { title: string; description?: string; sections: Section[] };

export type TenWebSitemapDraft = {
  id?: string; // Add optional id for draft identification
  website_id: number;
  unique_id: string;
  colors?: { background_dark?: string; primary_color?: string; secondary_color?: string };
  fonts?: { primary_font?: string };
  website_title?: string;
  website_keyphrase?: string;
  website_description?: string;
  pages_meta: PageMeta[];
  region?: string; // Add region for Frankfurt zone tracking
};

export type SiteBrief = {
  business_type: string;
  business_name: string;
  business_description: string;
  preferred_subdomain?: string;
};
