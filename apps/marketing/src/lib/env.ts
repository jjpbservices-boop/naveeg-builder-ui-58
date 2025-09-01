export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  STRIPE_SK: process.env.STRIPE_SECRET_KEY!,
  PSI: process.env.PSI_API_KEY ?? '',
}
