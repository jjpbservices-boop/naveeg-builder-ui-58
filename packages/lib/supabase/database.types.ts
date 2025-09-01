export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          plan: 'starter' | 'pro' | 'custom'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          plan?: 'starter' | 'pro' | 'custom'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          plan?: 'starter' | 'pro' | 'custom'
          created_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          owner: string
          domain: string | null
          status: 'generating' | 'online' | 'draft'
          brand_vibe: string
          industry: string
          goal: string
          created_at: string
        }
        Insert: {
          id?: string
          owner: string
          domain?: string | null
          status?: 'generating' | 'online' | 'draft'
          brand_vibe: string
          industry: string
          goal: string
          created_at?: string
        }
        Update: {
          id?: string
          owner?: string
          domain?: string | null
          status?: 'generating' | 'online' | 'draft'
          brand_vibe?: string
          industry?: string
          goal?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid'
          current_period_end: string
        }
        Insert: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status?: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid'
          current_period_end: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid'
          current_period_end?: string
        }
      }
      analytics_snapshots: {
        Row: {
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
        Insert: {
          id?: string
          site_id: string
          source: 'psi' | '10web'
          lcp: number
          cls: number
          inp: number
          performance: number
          pagespeed_raw: any
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          source?: 'psi' | '10web'
          lcp?: number
          cls?: number
          inp?: number
          performance?: number
          pagespeed_raw?: any
          created_at?: string
        }
      }
    }
  }
}
