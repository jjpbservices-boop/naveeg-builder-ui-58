// Input sanitization utilities

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")     // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)+/g, "")        // Remove leading/trailing hyphens
    .replace(/--+/g, "-")            // Collapse consecutive hyphens
    .slice(0, 30);                   // Max 30 characters
}

export function validateBusinessType(businessType: string): boolean {
  const allowedTypes = [
    'service', 'retail', 'restaurant', 'healthcare', 'education',
    'technology', 'finance', 'real-estate', 'nonprofit', 'consulting',
    'manufacturing', 'creative', 'fitness', 'legal', 'automotive'
  ];
  return allowedTypes.includes(businessType.toLowerCase());
}

export function validateStrategy(strategy: string): strategy is 'mobile' | 'desktop' {
  return strategy === 'mobile' || strategy === 'desktop';
}

export function validatePsiCategories(categories: string[]): boolean {
  const validCategories = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO'];
  return categories.every(cat => validCategories.includes(cat));
}

export function generateCredentials() {
  return {
    admin_username: `admin_${crypto.randomUUID().substring(0, 8)}`,
    admin_password: crypto.randomUUID()
  };
}