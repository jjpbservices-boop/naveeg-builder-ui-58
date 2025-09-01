import { PSIMetrics } from './types'

interface PSIResponse {
  lighthouseResult: {
    audits: {
      'largest-contentful-paint': { numericValue: number }
      'cumulative-layout-shift': { numericValue: number }
      'interaction-to-next-paint': { numericValue: number }
      performance: { score: number }
    }
    categories: {
      performance: { score: number }
    }
  }
}

export async function fetchPSI({
  url,
  strategy = 'mobile',
  apiKey,
}: {
  url: string
  strategy?: 'mobile' | 'desktop'
  apiKey: string
}): Promise<PSIMetrics> {
  const params = new URLSearchParams({
    url,
    key: apiKey,
    strategy,
    category: 'performance',
  })

  const response = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`
  )

  if (!response.ok) {
    throw new Error(`PSI API error: ${response.statusText}`)
  }

  const data: PSIResponse = await response.json()
  const audits = data.lighthouseResult.audits

  return {
    lcp: audits['largest-contentful-paint'].numericValue / 1000, // Convert to seconds
    cls: audits['cumulative-layout-shift'].numericValue,
    inp: audits['interaction-to-next-paint'].numericValue / 1000, // Convert to seconds
    performance: data.lighthouseResult.categories.performance.score * 100, // Convert to percentage
    url,
    strategy,
  }
}

export async function fetchTenWeb(url: string, apiKey?: string): Promise<PSIMetrics | null> {
  if (!apiKey) {
    return null
  }

  try {
    // This would be implemented when 10Web API is available
    // For now, return null to indicate it's not available
    return null
  } catch (error) {
    console.error('10Web API error:', error)
    return null
  }
}

export async function refreshAnalytics(url: string, apiKey: string): Promise<PSIMetrics> {
  // Fetch both mobile and desktop metrics
  const [mobileMetrics, desktopMetrics] = await Promise.all([
    fetchPSI({ url, strategy: 'mobile', apiKey }),
    fetchPSI({ url, strategy: 'desktop', apiKey }),
  ])

  // Return mobile metrics by default (more critical for most users)
  return mobileMetrics
}
