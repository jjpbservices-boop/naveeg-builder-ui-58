// Shared PageSpeed Insights client utilities

export interface PsiResult {
  performance_score: number;
  crux: any;
  lhr: any;
}

export async function fetchPsiReport(url: string, strategy: 'mobile' | 'desktop'): Promise<PsiResult> {
  const apiKey = Deno.env.get('PSI_API_KEY');
  
  if (!apiKey) {
    throw new Error('PSI_API_KEY environment variable is required');
  }

  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&strategy=${strategy}`;
  
  const response = await fetch(psiUrl);
  
  if (!response.ok) {
    throw new Error(`PSI API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  const performanceScore = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
  
  return {
    performance_score: performanceScore,
    crux: data.lighthouseResult?.audits?.['largest-contentful-paint'] || {},
    lhr: data.lighthouseResult || {}
  };
}

export function validateStrategy(strategy: string): strategy is 'mobile' | 'desktop' {
  return strategy === 'mobile' || strategy === 'desktop';
}
