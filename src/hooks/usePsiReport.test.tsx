import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePsiReport } from './usePsiReport';
import React from 'react';

// Mock the PSI client
vi.mock('@/lib/psi', () => ({
  getPsiReport: vi.fn(),
  mockPsiReport: {
    url: 'https://example.com',
    metrics: {
      performance_score: 85,
      accessibility_score: 92,
      best_practices_score: 88,
      seo_score: 95,
      first_contentful_paint: 1200,
      largest_contentful_paint: 2300,
      cumulative_layout_shift: 0.12,
    },
    tested_at: '2023-01-01T00:00:00.000Z',
    report_id: 'mock-report-id',
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: any }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePsiReport', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => usePsiReport('https://example.com'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch when URL is null', () => {
    const { result } = renderHook(() => usePsiReport(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch PSI report when enabled', async () => {
    const { result } = renderHook(() => usePsiReport('https://example.com'), {
      wrapper: createWrapper(),
    });

    // In development mode, it should return mock data
    expect(result.current.data).toBeDefined();
  });
});