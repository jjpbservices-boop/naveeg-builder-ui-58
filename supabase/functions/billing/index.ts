import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.22.4';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createHandler } from '../_shared/handler.ts';

const CreateCheckoutSchema = z.object({
  action: z.literal('create-checkout'),
  plan: z.enum(['starter', 'pro']),
  site_id: z.string().uuid(),
});

const CreatePortalSchema = z.object({
  action: z.literal('create-portal'),
  customer_id: z.string().optional(),
});

const BillingRequestSchema = z.discriminatedUnion('action', [
  CreateCheckoutSchema,
  CreatePortalSchema,
]);

const CheckoutResponseSchema = z.object({
  url: z.string().url(),
});

// Server-side plan configuration
const PLANS = {
  starter: {
    name: 'Starter Plan',
    price: 999, // $9.99 in cents
    currency: 'usd',
    interval: 'month' as const,
  },
  pro: {
    name: 'Pro Plan', 
    price: 2999, // $29.99 in cents
    currency: 'usd',
    interval: 'month' as const,
  },
};

async function handleCreateCheckout({ input, user, logger }: any) {
  const { plan, site_id } = input;
  
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  logger.step('Initializing Stripe client');
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  // Get or create Stripe customer
  logger.step('Looking up Stripe customer', { email: user.email });
  let customers = await stripe.customers.list({ email: user.email, limit: 1 });
  let customerId;

  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
    logger.step('Found existing customer', { customerId });
  } else {
    logger.step('Creating new customer');
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        user_id: user.id,
        site_id,
      },
    });
    customerId = customer.id;
    logger.step('Created new customer', { customerId });
  }

  // Get plan configuration
  const planConfig = PLANS[plan];
  if (!planConfig) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  logger.step('Creating checkout session', { plan, planConfig });

  const origin = Deno.env.get('SITE_URL') || 'http://localhost:5173';

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: planConfig.currency,
          product_data: {
            name: planConfig.name,
            metadata: {
              plan_type: plan,
            },
          },
          unit_amount: planConfig.price,
          recurring: {
            interval: planConfig.interval,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/plans?checkout=cancelled`,
    metadata: {
      user_id: user.id,
      site_id,
      plan_type: plan,
    },
  });

  logger.step('Checkout session created', { sessionId: session.id, url: session.url });

  return {
    url: session.url!,
  };
}

async function handleCreatePortal({ input, user, logger }: any) {
  const { customer_id } = input;
  
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  logger.step('Initializing Stripe client');
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  let customerId = customer_id;
  if (!customerId) {
    // Find customer by email
    logger.step('Looking up customer by email', { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error('No Stripe customer found for this user');
    }
    customerId = customers.data[0].id;
  }

  logger.step('Creating customer portal session', { customerId });

  const origin = Deno.env.get('SITE_URL') || 'http://localhost:5173';
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/billing`,
  });

  logger.step('Customer portal session created', { sessionId: portalSession.id, url: portalSession.url });

  return {
    url: portalSession.url,
  };
}

serve(
  createHandler('billing', async ({ input, user, logger }) => {
    const { action } = input;

    switch (action) {
      case 'create-checkout':
        return handleCreateCheckout({ input, user, logger });
      
      case 'create-portal':
        return handleCreatePortal({ input, user, logger });
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, {
    requireAuth: true,
    inputSchema: BillingRequestSchema,
    outputSchema: CheckoutResponseSchema,
  })
);