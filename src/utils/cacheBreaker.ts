// Cache breaker utility to prevent old cached code from running
export const clearAppCache = () => {
  // Clear all localStorage data that might contain cached trial creation logic
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('trial') || 
    key.includes('subscription') || 
    key.includes('onboarding') ||
    key.includes('auth')
  );
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Cleared cached data: ${key}`);
  });

  // Force reload to clear any cached JavaScript
  if (import.meta.env.PROD) {
    window.location.reload();
  }
};

// Version check to ensure we're running latest code
export const checkCodeVersion = () => {
  const currentVersion = '2025-01-27-v2'; // Update this when making changes
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion !== currentVersion) {
    console.log(`Code version mismatch. Stored: ${storedVersion}, Current: ${currentVersion}`);
    localStorage.setItem('app_version', currentVersion);
    
    // Clear any cached trial creation logic
    clearAppCache();
    return false; // Indicates cache was cleared
  }
  
  return true; // Cache is valid
};

// Initialize on app load
checkCodeVersion();