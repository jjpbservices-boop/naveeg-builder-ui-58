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

const CheckoutResponseSchema = z.object({
  url: z.string().url(),
});

async function handleCreateCheckout({ input, user, logger }: any) {
  const { plan, site_id } = input;
  
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  logger.step('Initializing Stripe client');
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  // Create Supabase service client for database operations
  const supabaseService = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  // Get plan details from database
  const { data: planData, error: planError } = await supabaseService
    .from('plans')
    .select('*')
    .eq('code', plan)
    .single();

  if (planError || !planData) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  logger.step('Found plan', { plan: planData.name, price: planData.price_month_cents });

  // Get or create Stripe customer
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
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

  // Use Stripe price ID if available, otherwise create price data
  const lineItems = [];
  if (planData.stripe_price_month_id) {
    lineItems.push({
      price: planData.stripe_price_month_id,
      quantity: 1,
    });
  } else {
    lineItems.push({
      price_data: {
        currency: planData.currency,
        product_data: {
          name: planData.name,
          metadata: {
            plan_code: plan,
          },
        },
        unit_amount: planData.price_month_cents,
        recurring: {
          interval: 'month',
        },
      },
      quantity: 1,
    });
  }

  logger.step('Creating checkout session');

  const origin = Deno.env.get('SITE_URL') || 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: lineItems,
    mode: 'subscription',
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/plans?checkout=cancelled`,
    metadata: {
      user_id: user.id,
      site_id,
      plan_code: plan,
    },
  });

  // Log the checkout creation
  await supabaseService.from('api_audit').insert({
    user_id: user.id,
    service: 'stripe',
    endpoint: '/checkout/sessions',
    method: 'POST',
    status_code: 200,
    request: { plan, site_id },
    response: { session_id: session.id },
  });

  logger.step('Checkout session created', { sessionId: session.id, url: session.url });

  return {
    url: session.url!,
  };
}

serve(
  createHandler('billing', async ({ input, user, logger }) => {
    const { action } = input;

    switch (action) {
      case 'create-checkout':
        return handleCreateCheckout({ input, user, logger });
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, {
    requireAuth: true,
    inputSchema: CreateCheckoutSchema,
    outputSchema: CheckoutResponseSchema,
  })
);