import { supabase } from '@/integrations/supabase/client'

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
  private async request<T = any>(
    path: string,
    options: { method?: string; query?: Record<string, any>; body?: any } & TenWebApiOptions = {}
  ): Promise<T> {
    console.log('[TENWEB_API] Making request:', { path, method: options.method || 'GET' })

    const {
      method = 'GET',
      query,
      body,
      timeout = 30000,
      retryAttempts = 3,
      retryDelay = 1000,
    } = options

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`[TENWEB_API] Attempt ${attempt}/${retryAttempts} for ${path}`)
        
        const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
          body: {
            path,
            method,
            query,
            body
          }
        })

        if (error) {
          console.error('[TENWEB_API] Supabase function error:', error)
          throw new TenWebApiError(
            error.message || 'Proxy request failed',
            500,
            'PROXY_ERROR',
            error
          )
        }

        console.log('[TENWEB_API] Request successful:', { path, dataReceived: !!data })
        return data
      } catch (error) {
        lastError = error as Error
        console.error(`[TENWEB_API] Attempt ${attempt} failed:`, error)
        
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

    throw lastError || new TenWebApiError('Request failed after all retries', 500, 'REQUEST_FAILED')
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
      body: { domain_name: domain }
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
      query: { admin_url: adminUrl }
    })
  }

  // Analytics
  async getVisitors(websiteId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/visitors`, {
      query: { period }
    })
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
      body: { ttl }
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
      body: { recache }
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
      body: { version }
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
      body: { action }
    })
  }

  async whitelistIP(websiteId: string, ip: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/whitelist/ip`, {
      method: 'POST',
      body: { ip }
    })
  }

  // Pages Management
  async listPages(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages`)
  }

  async addBlankPage(websiteId: string, title: string): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/blank/add`, {
      method: 'POST',
      body: { title }
    })
  }

  async deletePages(websiteId: string, pageIds: string[]): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/delete`, {
      method: 'POST',
      body: { page_ids: pageIds }
    })
  }

  async publishPages(websiteId: string, pageIds: string[], action: 'publish' | 'draft'): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/publish`, {
      method: 'POST',
      body: { page_ids: pageIds, action }
    })
  }

  async setFrontPage(websiteId: string, pageId: string): Promise<TenWebResponse> {
    return this.request(`/v1/builder/websites/${websiteId}/pages/front/set`, {
      method: 'POST',
      body: { page_id: pageId }
    })
  }

  // Advanced Features
  async getInstanceInfo(websiteId: string): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/instance-info`)
  }

  async getLogs(websiteId: string, type: 'access' | 'error' | 'php', lines: number = 500): Promise<TenWebResponse> {
    return this.request(`/v1/hosting/websites/${websiteId}/logs`, {
      query: { type, lines }
    })
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