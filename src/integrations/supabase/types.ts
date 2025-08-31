export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      // ... other tables ...

      sites: {
        Row: {
          admin_url: string | null
          business_description: string | null
          business_name: string | null
          business_type: string | null
          colors: Json | null
          created_at: string | null
          created_by: string | null
          email: string | null
          fonts: Json | null
          id: string
          is_generating: boolean | null
          owner_email: string | null
          pages_meta: Json | null
          payload: Json | null
          plan: string | null
          seo_description: string | null
          seo_keyphrase: string | null
          seo_title: string | null
          site_url: string | null
          status: string | null
          subdomain: string | null
          title: string | null
          unique_id: string | null
          updated_at: string | null
          user_id: string
          website_id: number
          /** NEW FIELD: the numeric 10Web website_id */
          tenweb_website_id: number
          website_type: string | null
        }
        Insert: {
          admin_url?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          colors?: Json | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          fonts?: Json | null
          id?: string
          is_generating?: boolean | null
          owner_email?: string | null
          pages_meta?: Json | null
          payload?: Json | null
          plan?: string | null
          seo_description?: string | null
          seo_keyphrase?: string | null
          seo_title?: string | null
          site_url?: string | null
          status?: string | null
          subdomain?: string | null
          title?: string | null
          unique_id?: string | null
          updated_at?: string | null
          user_id: string
          website_id: number
          /** NEW FIELD */
          tenweb_website_id: number
          website_type?: string | null
        }
        Update: {
          admin_url?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          colors?: Json | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          fonts?: Json | null
          id?: string
          is_generating?: boolean | null
          owner_email?: string | null
          pages_meta?: Json | null
          payload?: Json | null
          plan?: string | null
          seo_description?: string | null
          seo_keyphrase?: string | null
          seo_title?: string | null
          site_url?: string | null
          status?: string | null
          subdomain?: string | null
          title?: string | null
          unique_id?: string | null
          updated_at?: string | null
          user_id?: string
          website_id?: number
          /** NEW FIELD */
          tenweb_website_id?: number
          website_type?: string | null
        }
        Relationships: []
      }

      // ... rest of your tables ...
    }

    // Views, Functions, Enums, CompositeTypes unchanged…
  }
}

// convenience types unchanged
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

// ... Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes, Constants unchanged ...