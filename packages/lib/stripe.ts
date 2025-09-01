import Stripe from 'stripe'

export async function createCheckoutSession(
  stripe: Stripe,
  {
    priceId,
    customerId,
    successUrl,
    cancelUrl,
  }: {
    priceId: string
    customerId?: string
    successUrl: string
    cancelUrl: string
  }
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  return session
}

export async function createPortalSession(stripe: Stripe, customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getCustomer(stripe: Stripe, customerId: string) {
  return stripe.customers.retrieve(customerId)
}

export async function getSubscription(stripe: Stripe, subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}
