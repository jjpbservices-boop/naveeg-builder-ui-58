import { supabase } from '@/integrations/supabase/client'

// 10Web API Client Configuration
const TENWEB_API_BASE = 'https://api.10web.io'

interface TenWebApiOptions {
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

interface TenWebResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class TenWebApiError extends Error {
  public status: number
  public code?: string
  public details?: any

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message)
    this.name = 'TenWebApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

class TenWebApiClient {
  private apiKey: string | null = null
  private baseUrl: string = TENWEB_API_BASE

  async initialize() {
    if (!this.apiKey) {
      // Get API key from Supabase secrets via edge function
      try {
        const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
          body: { action: 'get-api-key' }
        })
        if (error) throw error
        this.apiKey = data?.apiKey
      } catch (error) {
        console.error('[TENWEB_API] Failed to get API key:', error)
        throw new TenWebApiError('Failed to initialize 10Web API client', 500, 'INIT_ERROR')
      }
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit & TenWebApiOptions = {}
  ): Promise<T> {
    await this.initialize()

    if (!this.apiKey) {
      throw new TenWebApiError('API key not available', 401, 'UNAUTHORIZED')
    }

    const {
      timeout = 30000,
      retryAttempts = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...options.headers,
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          
          // Retry on 429 (rate limit) or 5xx errors
          if ((response.status === 429 || response.status >= 500) && attempt < retryAttempts) {
            await this.delay(retryDelay * attempt)
            continue
          }

          throw new TenWebApiError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.code,
            errorData
          )
        }

        const data = await response.json()
        return data
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on auth errors or client errors (except rate limit)
        if (error instanceof TenWebApiError) {
          if (error.status < 500 && error.status !== 429) {
            throw error
          }
        }

        if (attempt < retryAttempts) {
          await this.delay(retryDelay * attempt)
          continue
        }
      }
    }

    clearTimeout(timeoutId)
    throw lastError || new TenWebApiError('Request failed', 500, 'REQUEST_FAILED')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Domain Management
  async listDomains(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/domain-name`)
  }

  async addDomain(websiteId: string, domain: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/domain-name`, {
      method: 'POST',
      body: JSON.stringify({ domain_name: domain })
    })
  }

  async setDefaultDomain(websiteId: string, domainId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/domain-name/${domainId}/default`, {
      method: 'POST'
    })
  }

  async deleteDomain(websiteId: string, domainId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/domain-name/${domainId}/delete`, {
      method: 'DELETE'
    })
  }

  // SSL Certificate Management
  async listCertificates(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/certificate`)
  }

  async issueFreeSSL(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/certificate/free`, {
      method: 'POST'
    })
  }

  async removeSSL(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/certificate/remove`, {
      method: 'DELETE'
    })
  }

  // WordPress Admin
  async generateAdminToken(websiteId: string, adminUrl: string): Promise<TenWebResponse> {
    return this.request(`/v1/account/websites/${websiteId}/single`, {
      method: 'GET',
      headers: {
        'X-Admin-URL': adminUrl
      }
    })
  }

  // Analytics
  async getVisitors(websiteId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/visitors?period=${period}`)
  }

  // Backup Management
  async listBackups(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/backup/list`)
  }

  async runBackup(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/backup/run`, {
      method: 'POST'
    })
  }

  async restoreBackup(websiteId: string, backupId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/backup/${backupId}/restore`, {
      method: 'POST'
    })
  }

  // Staging Environment
  async enableStaging(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/staging/enable`, {
      method: 'POST'
    })
  }

  async pushToStaging(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/push-to-staging`, {
      method: 'POST'
    })
  }

  async pushToLive(stagingWebsiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${stagingWebsiteId}/push-to-live`, {
      method: 'POST'
    })
  }

  async disableStaging(stagingWebsiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${stagingWebsiteId}/staging/disable`, {
      method: 'POST'
    })
  }

  // Cache Management
  async enableCache(websiteId: string, ttl?: number): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/cache/enable`, {
      method: 'PUT',
      body: JSON.stringify({ ttl })
    })
  }

  async disableCache(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/cache/disable`, {
      method: 'PUT'
    })
  }

  async purgeCache(websiteId: string, recache?: boolean): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/cache`, {
      method: 'DELETE',
      body: JSON.stringify({ recache })
    })
  }

  async toggleObjectCache(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/object-cache/toggle`, {
      method: 'POST'
    })
  }

  async flushObjectCache(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/object-cache/flush`, {
      method: 'POST'
    })
  }

  // PHP Management
  async getSupportedPhpVersions(): Promise<TenWebResponse> {
    return this.request('/v1/hosting/supported-php-versions')
  }

  async switchPhpVersion(websiteId: string, version: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/php-version/switch`, {
      method: 'POST',
      body: JSON.stringify({ version })
    })
  }

  async restartPhp(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/php/restart`, {
      method: 'POST'
    })
  }

  // Settings
  async getSettings(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/settings`)
  }

  // Security
  async togglePasswordProtection(websiteId: string, action: 'enable' | 'disable'): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/password-protection`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
  }

  async whitelistIP(websiteId: string, ip: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/whitelist/ip`, {
      method: 'POST',
      body: JSON.stringify({ ip })
    })
  }

  // Pages Management
  async listPages(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages`)
  }

  async addBlankPage(websiteId: string, title: string): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/blank/add`, {
      method: 'POST',
      body: JSON.stringify({ title })
    })
  }

  async deletePages(websiteId: string, pageIds: string[]): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/delete`, {
      method: 'POST',
      body: JSON.stringify({ page_ids: pageIds })
    })
  }

  async publishPages(websiteId: string, pageIds: string[], action: 'publish' | 'draft'): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/publish`, {
      method: 'POST',
      body: JSON.stringify({ page_ids: pageIds, action })
    })
  }

  async setFrontPage(websiteId: string, pageId: string): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/front/set`, {
      method: 'POST',
      body: JSON.stringify({ page_id: pageId })
    })
  }

  // Advanced Features
  async getInstanceInfo(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/instance-info`)
  }

  async getLogs(websiteId: string, type: 'access' | 'error' | 'php', lines: number = 500): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/logs?type=${type}&lines=${lines}`)
  }

  async getStorage(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/storage`)
  }

  // DNS Zones (optional helper)
  async getAvailableZones(): Promise<TenWebResponse> {
    return this.request('/v1/hosting/zone/available')
  }

  async getZones(): Promise<TenWebResponse> {
    return this.request('/v1/hosting/zone')
  }

  async getZoneRecords(zoneId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/zone/${zoneId}/records`)
  }
}

// Export singleton instance
export const tenwebApi = new TenWebApiClient()
export { TenWebApiError }
export type { TenWebResponse }