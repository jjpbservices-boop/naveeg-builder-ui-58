import { PlanId } from '../data/pricing.config';

export type UserPlan = PlanId | null;

export type Action = 
  | 'create_site'
  | 'add_pages'
  | 'use_blog'
  | 'use_ai_copilot'
  | 'use_analytics'
  | 'use_automations'
  | 'use_multi_language'
  | 'use_advanced_customization'
  | 'use_multi_site'
  | 'use_advanced_integrations'
  | 'use_enterprise_features';

export function canDo(userPlan: UserPlan, action: Action): boolean {
  if (!userPlan) return false;

  switch (action) {
    // Basic actions - all plans
    case 'create_site':
      return true;
    
    // Starter plan limits
    case 'add_pages':
      return userPlan === 'pro' || userPlan === 'custom';
    
    case 'use_blog':
      return userPlan === 'pro' || userPlan === 'custom';
    
    // Pro plan features
    case 'use_ai_copilot':
      return userPlan === 'pro' || userPlan === 'custom';
    
    case 'use_analytics':
      return userPlan === 'pro' || userPlan === 'custom';
    
    case 'use_automations':
      return userPlan === 'pro' || userPlan === 'custom';
    
    case 'use_multi_language':
      return userPlan === 'pro' || userPlan === 'custom';
    
    case 'use_advanced_customization':
      return userPlan === 'pro' || userPlan === 'custom';
    
    // Custom plan only features
    case 'use_multi_site':
      return userPlan === 'custom';
    
    case 'use_advanced_integrations':
      return userPlan === 'custom';
    
    case 'use_enterprise_features':
      return userPlan === 'custom';
    
    default:
      return false;
  }
}

export function getPlanLimits(userPlan: UserPlan) {
  if (!userPlan) return null;

  switch (userPlan) {
    case 'starter':
      return {
        maxPages: 5,
        maxSites: 1,
        hasBlog: false,
        hasAnalytics: false,
        hasAutomations: false,
        hasMultiLanguage: false,
        hasAdvancedCustomization: false
      };
    
    case 'pro':
      return {
        maxPages: -1, // unlimited
        maxSites: 1,
        hasBlog: true,
        hasAnalytics: true,
        hasAutomations: true,
        hasMultiLanguage: true,
        hasAdvancedCustomization: true
      };
    
    case 'custom':
      return {
        maxPages: -1, // unlimited
        maxSites: -1, // unlimited
        hasBlog: true,
        hasAnalytics: true,
        hasAutomations: true,
        hasMultiLanguage: true,
        hasAdvancedCustomization: true
      };
    
    default:
      return null;
  }
}

export function getUpgradeMessage(userPlan: UserPlan, action: Action): string | null {
  if (canDo(userPlan, action)) return null;

  switch (action) {
    case 'add_pages':
      return 'Upgrade to Pro for unlimited pages and blog functionality';
    
    case 'use_ai_copilot':
      return 'Upgrade to Pro to use AI Copilot for content editing';
    
    case 'use_analytics':
      return 'Upgrade to Pro for built-in SEO and Analytics tools';
    
    case 'use_automations':
      return 'Upgrade to Pro for marketing automations and workflows';
    
    case 'use_multi_language':
      return 'Upgrade to Pro for multi-language site setup';
    
    case 'use_advanced_customization':
      return 'Upgrade to Pro for advanced customization options';
    
    case 'use_multi_site':
      return 'Contact us for custom enterprise solutions';
    
    case 'use_advanced_integrations':
      return 'Contact us for custom enterprise solutions';
    
    default:
      return 'Upgrade your plan to access this feature';
  }
}
