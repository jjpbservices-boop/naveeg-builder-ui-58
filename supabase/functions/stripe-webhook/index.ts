import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event verified", { type: event.type, id: event.id });

    // Create service role client for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });

        if (session.mode === 'subscription' && session.subscription) {
          // Fetch the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const metadata = session.metadata || {};
          const { user_id, site_id } = metadata;

          if (!user_id || !site_id) {
            logStep("Missing required metadata", { metadata });
            break;
          }

          // Get plan_id from price_id via stripe_prices table
          const priceId = subscription.items.data[0].price.id;
          const { data: priceData, error: priceError } = await supabase
            .from('stripe_prices')
            .select('plan_id')
            .eq('price_id', priceId)
            .single();

          if (priceError || !priceData) {
            logStep("Error finding plan for price", { priceId, error: priceError });
            break;
          }

          const subscriptionData = {
            user_id,
            site_id,
            plan_id: priceData.plan_id,
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            metadata: session.metadata,
            updated_at: new Date().toISOString(),
          };

          // Upsert subscription by stripe_subscription_id
          const { error: upsertError } = await supabase
            .from('subscriptions')
            .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

          if (upsertError) {
            logStep("Error upserting subscription", { error: upsertError });
          } else {
            logStep("Subscription upserted successfully", { subscriptionId: subscription.id });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep(`Processing ${event.type}`, { subscriptionId: subscription.id });

        // Find existing subscription record to get user_id and site_id
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id, site_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          logStep("Error finding existing subscription", { error: findError });
          break;
        }

        if (!existingSubscription) {
          logStep("No existing subscription found, skipping", { subscriptionId: subscription.id });
          break;
        }

        // Get plan_id from price_id
        const priceId = subscription.items.data[0].price.id;
        const { data: priceData, error: priceError } = await supabase
          .from('stripe_prices')
          .select('plan_id')
          .eq('price_id', priceId)
          .single();

        if (priceError || !priceData) {
          logStep("Error finding plan for price", { priceId, error: priceError });
          break;
        }

        const subscriptionData = {
          user_id: existingSubscription.user_id,
          site_id: existingSubscription.site_id,
          plan_id: priceData.plan_id,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

        if (upsertError) {
          logStep("Error upserting subscription", { error: upsertError });
        } else {
          logStep("Subscription updated successfully", { subscriptionId: subscription.id });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });

        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          logStep("Error updating subscription to canceled", { error: updateError });
        } else {
          logStep("Subscription marked as canceled", { subscriptionId: subscription.id });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});