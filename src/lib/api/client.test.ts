import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchJson, ApiError, NetworkError } from './client';

// Mock fetch
global.fetch = vi.fn();

describe('API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  describe('fetchJson', () => {
    it('should make successful requests', async () => {
      const mockData = { success: true, data: 'test' };
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockData),
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await fetchJson('/test');
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError for HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not found'),
      };
      
      (fetch as any).mockResolvedValueOnce(mockResponse);

      await expect(fetchJson('/test')).rejects.toThrow(ApiError);
    });

    it('should retry on network errors', async () => {
      (fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const result = await fetchJson('/test');
      expect(result).toEqual({ success: true });
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should timeout requests', async () => {
      (fetch as any).mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 15000))
      );

      const promise = fetchJson('/test', {}, 3, 5000);
      
      // Fast-forward past timeout
      vi.advanceTimersByTime(6000);
      
      await expect(promise).rejects.toThrow(NetworkError);
    });
  });
});