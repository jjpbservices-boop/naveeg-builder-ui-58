import Stripe from 'stripe';

export const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2025-08-27.basil';

let client: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY missing');
  if (!client) client = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  return client;
}

export type { Stripe };