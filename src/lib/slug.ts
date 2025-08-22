/**
 * Convert text to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Validate if a string is a valid subdomain
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Subdomain rules:
  // - 1-63 characters
  // - Only alphanumeric and hyphens
  // - Cannot start or end with hyphen
  // - Cannot be purely numeric
  const pattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  
  if (!pattern.test(subdomain)) {
    return false;
  }
  
  // Cannot be purely numeric
  if (/^\d+$/.test(subdomain)) {
    return false;
  }
  
  return true;
}

/**
 * Generate a unique subdomain from business name
 */
export function generateSubdomain(businessName: string, timestamp?: number): string {
  const baseSlug = slugify(businessName);
  const suffix = timestamp || Date.now();
  
  // Ensure it's not too long (max 63 chars for subdomain)
  const maxBaseLength = 50; // Leave room for timestamp suffix
  const truncatedBase = baseSlug.length > maxBaseLength 
    ? baseSlug.substring(0, maxBaseLength).replace(/-$/, '')
    : baseSlug;
  
  const subdomain = `${truncatedBase}-${suffix}`;
  
  // Validate the generated subdomain
  if (!isValidSubdomain(subdomain)) {
    // Fallback to a simple pattern if validation fails
    return `site-${suffix}`;
  }
  
  return subdomain;
}

/**
 * Clean and normalize user input for subdomain
 */
export function normalizeSubdomain(input: string): string {
  const cleaned = slugify(input);
  
  if (!cleaned || !isValidSubdomain(cleaned)) {
    throw new Error('Invalid subdomain format');
  }
  
  return cleaned;
}