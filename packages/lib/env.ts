import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),

  // Stripe
  STRIPE_PUBLIC_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_STARTER: z.string().min(1),
  STRIPE_PRICE_PRO: z.string().min(1),
  STRIPE_PORTAL_RETURN_URL: z.string().url(),

  // Analytics
  PAGESPEED_API_KEY: z.string().min(1),
  TENWEB_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)

export const featureFlags = {
  ENABLE_TENWEB: Boolean(env.TENWEB_API_KEY),
} as const
