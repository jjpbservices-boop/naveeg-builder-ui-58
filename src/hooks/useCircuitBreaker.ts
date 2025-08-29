import { useRef, useCallback } from 'react';

interface CircuitBreakerConfig {
  maxFailures: number;
  resetTimeout: number;
  failureThreshold?: number;
}

interface CircuitBreakerState {
  failures: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: number;
}

export const useCircuitBreaker = (config: CircuitBreakerConfig) => {
  const state = useRef<CircuitBreakerState>({
    failures: 0,
    state: 'closed',
    nextAttempt: 0,
  });

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    fallback?: () => T
  ): Promise<T | null> => {
    const now = Date.now();
    
    // Check if circuit is open and still in timeout
    if (state.current.state === 'open' && now < state.current.nextAttempt) {
      console.log('Circuit breaker is OPEN, operation blocked');
      return fallback ? fallback() : null;
    }
    
    // If timeout has passed, move to half-open
    if (state.current.state === 'open' && now >= state.current.nextAttempt) {
      state.current.state = 'half-open';
    }
    
    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (state.current.state === 'half-open' || state.current.failures > 0) {
        state.current.failures = 0;
        state.current.state = 'closed';
        console.log('Circuit breaker reset to CLOSED');
      }
      
      return result;
    } catch (error) {
      state.current.failures++;
      
      // Open circuit if max failures reached
      if (state.current.failures >= config.maxFailures) {
        state.current.state = 'open';
        state.current.nextAttempt = now + config.resetTimeout;
        console.log(`Circuit breaker opened after ${state.current.failures} failures`);
      }
      
      console.error('Circuit breaker recorded failure:', error);
      throw error;
    }
  }, [config.maxFailures, config.resetTimeout]);

  const getState = useCallback(() => state.current, []);

  return { execute, getState };
};