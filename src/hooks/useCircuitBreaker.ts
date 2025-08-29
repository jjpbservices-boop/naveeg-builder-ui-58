import { useRef, useCallback } from 'react';

interface CircuitBreakerOptions {
  maxFailures: number;
  resetTimeout: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export const useCircuitBreaker = (options: CircuitBreakerOptions) => {
  const { maxFailures = 3, resetTimeout = 60000 } = options;
  
  const stateRef = useRef<CircuitBreakerState>({
    failures: 0,
    lastFailureTime: 0,
    state: 'closed'
  });

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    const now = Date.now();
    const state = stateRef.current;

    // If circuit is open, check if we should reset
    if (state.state === 'open') {
      if (now - state.lastFailureTime > resetTimeout) {
        state.state = 'half-open';
        state.failures = 0;
      } else {
        console.log('Circuit breaker is open, operation blocked');
        return null;
      }
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (state.state === 'half-open') {
        state.state = 'closed';
      }
      state.failures = 0;
      
      return result;
    } catch (error) {
      state.failures++;
      state.lastFailureTime = now;
      
      // Open circuit if max failures reached
      if (state.failures >= maxFailures) {
        state.state = 'open';
        console.log(`Circuit breaker opened after ${state.failures} failures`);
      }
      
      throw error;
    }
  }, [maxFailures, resetTimeout]);

  const isOpen = useCallback(() => {
    return stateRef.current.state === 'open';
  }, []);

  const reset = useCallback(() => {
    stateRef.current = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed'
    };
  }, []);

  return { execute, isOpen, reset };
};