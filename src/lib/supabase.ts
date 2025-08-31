import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";

let client: SupabaseClient<Database> | null = null;

export function getSupabase() {
  if (!client) {
    client = createClient<Database>(
      "https://eilpazegjrcrwgpujqni.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhemVnanJjcndncHVqcW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYxNjksImV4cCI6MjA3MDE1MjE2OX0.LV5FvbQQGf0Kv-O1uA0tsS-Yam6rB1x937BgqFsJoX4",
      { 
        auth: { 
          persistSession: true, 
          autoRefreshToken: true,
          storage: localStorage
        }
      }
    );
  }
  return client;
}