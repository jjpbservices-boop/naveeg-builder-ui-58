// Clear stale localStorage entries that might interfere with subscription state
export function clearStaleStorage() {
  try {
    // Remove any plan-related localStorage keys
    const keysToRemove = [
      'usePlanStore',
      'planStore', 
      'subscriptionStore',
      'trialStore'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`[CLEANUP] Removing stale localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('[CLEANUP] Error clearing localStorage:', error);
  }
}

// Run cleanup immediately
clearStaleStorage();