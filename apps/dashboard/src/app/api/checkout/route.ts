import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PLANS, getPlanById } from '@naveeg/lib';

// Type guard for plan properties
function hasContact(plan: any): plan is { contact: true } {
  return 'contact' in plan && plan.contact === true;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    const planData = getPlanById(plan);
    
    if (!planData) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }
    
    if (hasContact(planData)) {
      return NextResponse.json(
        { error: 'Custom plans require contacting sales' },
        { status: 400 }
      );
    }

    if (!planData.stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this plan' },
        { status: 500 }
      );
    }

    // TODO: Get user ID from authenticated session
    const userId = 'mock-user-id';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: 'user@example.com', // TODO: Get from authenticated user
      line_items: [
        {
          price: planData.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/app/billing?success=1`,
      cancel_url: `${request.nextUrl.origin}/app/billing`,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
