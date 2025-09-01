import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Get customer ID from authenticated user's subscription
    const customerId = 'mock-customer-id';

    // For now, create a new customer if none exists
    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch {
      // Create a mock customer for demo purposes
      customer = await stripe.customers.create({
        email: 'user@example.com',
        metadata: {
          userId: 'mock-user-id',
        },
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${request.nextUrl.origin}/app/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
