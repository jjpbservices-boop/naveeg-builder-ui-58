// TODO: Generate types from OpenAPI schema at /mnt/data/openapi.yaml
// This file should contain generated TypeScript types from the OpenAPI specification

// Placeholder types until OpenAPI generation is implemented
export interface Website {
  id: string;
  user_id: string;
  title: string;
  description: string;
  site_url: string;
  admin_url: string;
  tenweb_website_id: string;
  status: 'active' | 'inactive' | 'building' | 'error';
  subdomain: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripe_price_id: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWebsiteRequest {
  title: string;
  description: string;
  business_type: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface CreateWebsiteResponse {
  website_id: string;
  site_url: string;
  admin_url: string;
  subdomain: string;
}

export interface PsiMetrics {
  performance_score: number;
  accessibility_score: number;
  best_practices_score: number;
  seo_score: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  cumulative_layout_shift: number;
}