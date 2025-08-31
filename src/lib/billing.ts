import { z } from 'zod';
import { invokeSupabaseFunction } from '@/lib/api/client';
import { useAppStore } from '@/lib/stores/useAppStore';

// Billing schemas
export const CreateCheckoutSchema = z.object({
  action: z.literal('create-checkout'),
  plan: z.enum(['starter', 'pro']),
  site_id: z.string().uuid(),
});

export const CreatePortalSchema = z.object({
  action: z.literal('create-portal'),
  customer_id: z.string().optional(),
});

export const CheckoutResponseSchema = z.object({
  url: z.string().url(),
});

export type CreateCheckoutRequest = z.infer<typeof CreateCheckoutSchema>;
export type CreatePortalRequest = z.infer<typeof CreatePortalSchema>;
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

// Enhanced billing service with store integration
export class BillingService {
  
  static async createCheckout(plan: 'starter' | 'pro', siteId: string): Promise<string> {
    const request: CreateCheckoutRequest = {
      action: 'create-checkout',
      plan,
      site_id: siteId,
    };

    const response = await invokeSupabaseFunction('billing', request, CheckoutResponseSchema);
    
    // Use location.assign for checkout redirects (same tab)
    if (response.url) {
      window.location.assign(response.url);
    }
    
    return response.url;
  }

  static async createCustomerPortal(customerId?: string): Promise<string> {
    const request: CreatePortalRequest = {
      action: 'create-portal',
      customer_id: customerId,
    };

    const response = await invokeSupabaseFunction('billing', request, CheckoutResponseSchema);
    
    // Use location.assign for portal redirects (same tab)
    if (response.url) {
      window.location.assign(response.url);
    }
    
    return response.url;
  }

  static async refreshSubscriptionStatus(): Promise<void> {
    // This would typically call a subscription status endpoint
    // For now, we'll trigger a store refresh
    const store = useAppStore.getState();
    store.setSubscriptionLoading(true);
    
    try {
      // TODO: Implement subscription status check endpoint
      // const status = await invokeSupabaseFunction('check-subscription');
      // store.setCurrentSubscription(status.subscription);
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
    } finally {
      store.setSubscriptionLoading(false);
    }
  }
}

// Legacy API compatibility (for gradual migration)
export const createCheckout = BillingService.createCheckout;
export const createCustomerPortal = BillingService.createCustomerPortal;