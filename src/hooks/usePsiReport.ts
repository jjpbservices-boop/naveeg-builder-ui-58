import { useQuery } from '@tanstack/react-query';
import { getPsiReport, mockPsiReport, type PsiReport } from '@/lib/psi';

export function usePsiReport(url: string | null, enabled = true) {
  return useQuery({
    queryKey: ['psi-report', url],
    queryFn: async (): Promise<PsiReport> => {
      if (!url) {
        throw new Error('URL is required');
      }
      
      // Use mock data in development
      if (import.meta.env.DEV) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { ...mockPsiReport, url };
      }
      
      return getPsiReport(url);
    },
    enabled: enabled && !!url,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}