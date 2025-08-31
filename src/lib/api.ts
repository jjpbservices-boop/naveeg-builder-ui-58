// Enhanced API layer for dashboard functionality
import { supabase } from "@/integrations/supabase/client";

// TypeScript interfaces for API responses
export type Period = 'day' | 'week' | 'month' | 'year';
export type PSIStrategy = 'mobile' | 'desktop';

export interface VisitorsPoint {
  count: number;
  date: string;
}

export interface VisitorsResponse {
  status: 'ok' | 'error';
  data: VisitorsPoint[];
  start_date: string;
  end_date: string;
  sum: number;
}

export interface StorageResponse {
  status: 'ok' | 'error';
  db_size: number;
  files_size: number;
}

export interface BackupItem {
  backup_id: number;
  backup_size: number;
  backup_time: string;
  created_at: string;
  type: string;
}

export interface BackupListResponse {
  status: 'ok' | 'error';
  data: BackupItem[];
}

export interface DomainItem {
  id: number;
  name: string;
  default: 0 | 1;
  site_url: string;
  admin_url: string;
  scheme: 'http' | 'https';
  created_at: string;
  updated_at: string;
  website_id?: number;
}

export interface DomainListResponse {
  data: DomainItem[];
}

export interface Certificate {
  id: number;
  common_name: string;
  domain_name: string;
  issuer: string;
  status: string;
  type: 'custom' | 'free';
  valid_from: string;
  valid_to: string;
}

export interface CertificateListResponse {
  status: 'ok' | 'error';
  data: Certificate[];
}

export interface SettingsData {
  cache_enabled: boolean;
  cache_time: number;
  object_cache: boolean;
  php_version: string;
  staging_enabled: boolean;
  password_protection: boolean;
  id?: number;
}

export interface SettingsResponse {
  status: 'ok' | 'error';
  data: SettingsData;
}

export interface AutologinResponse {
  status: 'ok' | 'error';
  token?: string;
  admin_url?: string;
}

export interface PSIRequest {
  url: string;
  strategy?: PSIStrategy;
  locale?: string;
  categories?: string[];
}

export interface PSIResponse {
  lighthouseResult?: {
    categories: {
      performance?: { score: number };
      seo?: { score: number };
      'best-practices'?: { score: number };
      accessibility?: { score: number };
    };
    audits: {
      [key: string]: {
        numericValue?: number;
        score?: number;
        details?: any;
      };
    };
  };
  loadingExperience?: {
    metrics: {
      [key: string]: {
        percentile: number;
        category: string;
      };
    };
  };
  originLoadingExperience?: {
    metrics: {
      [key: string]: {
        percentile: number;
        category: string;
      };
    };
  };
  error?: {
    message: string;
  };
}

// API client functions
export const api = {
  // Visitors/Traffic data
  async getVisitors(websiteId: number, period: Period = 'month'): Promise<VisitorsResponse> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/hosting/websites/${websiteId}/visitors`,
        method: 'GET',
        query: { period }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Storage usage
  async getStorage(websiteId: number): Promise<StorageResponse> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/hosting/websites/${websiteId}/storage`,
        method: 'GET'
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Backups
  async getBackups(websiteId: number): Promise<BackupListResponse> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/hosting/websites/${websiteId}/backup/list`,
        method: 'GET'
      }
    });
    
    if (error) throw error;
    return data;
  },

  async restoreBackup(websiteId: number, backupId: number): Promise<any> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/hosting/websites/${websiteId}/backup/${backupId}/restore`,
        method: 'POST'
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Domains
  async getDomains(websiteId: number): Promise<DomainListResponse> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/hosting/websites/${websiteId}/domain-name`,
        method: 'GET'
      }
    });
    
    if (error) throw error;
    return data;
  },

  // SSL Certificates
  async getCertificates(websiteId: number): Promise<CertificateListResponse> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/hosting/websites/${websiteId}/certificate`,
        method: 'GET'
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Settings
  async getSettings(websiteId: number): Promise<SettingsResponse> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/hosting/websites/${websiteId}/settings`,
        method: 'GET'
      }
    });
    
    if (error) throw error;
    return data;
  },

  // WordPress Admin Autologin
  async getAutologin(websiteId: number, adminUrl: string): Promise<AutologinResponse> {
    const { data, error } = await supabase.functions.invoke('tenweb-proxy', {
      body: {
        path: `/v1/account/websites/${websiteId}/single`,
        method: 'GET',
        query: { admin_url: adminUrl }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // PageSpeed Insights
  async runPSI(request: PSIRequest): Promise<PSIResponse> {
    const { data, error } = await supabase.functions.invoke('psi-proxy', {
      body: {
        url: request.url,
        strategy: request.strategy || 'mobile',
        locale: request.locale || 'en',
        categories: request.categories || ['performance', 'seo', 'best-practices', 'accessibility']
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Run PSI for both mobile and desktop
  async runPSIBoth(url: string, locale = 'en'): Promise<{ mobile: PSIResponse; desktop: PSIResponse }> {
    const [mobile, desktop] = await Promise.all([
      this.runPSI({ url, strategy: 'mobile', locale }),
      this.runPSI({ url, strategy: 'desktop', locale })
    ]);
    
    return { mobile, desktop };
  },

  // Legacy functions for backward compatibility
  async createWebsite(businessName: string) {
    const { createWebsite } = await import('./legacyApi');
    return createWebsite(businessName);
  },

  async generateSitemap(website_id: number, params: any) {
    const { generateSitemap } = await import('./legacyApi');
    return generateSitemap(website_id, params);
  },

  async updateDesign(siteId: number, design: any) {
    const { updateDesign } = await import('./legacyApi');
    return updateDesign(siteId, design);
  },

  async generateFromWithPolling(website_id: number, unique_id: string, params: any) {
    const { generateFromWithPolling } = await import('./legacyApi');
    return generateFromWithPolling(website_id, unique_id, params);
  },

  async publishAndFrontWithPolling(website_id: number) {
    const { publishAndFrontWithPolling } = await import('./legacyApi');
    return publishAndFrontWithPolling(website_id);
  }
};

// Helper functions for data processing
export const helpers = {
  // Calculate percentage change
  calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Format bytes to human readable
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },

  // Calculate days remaining for SSL certificates
  getDaysRemaining(validTo: string): number {
    const expiry = new Date(validTo);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Get PSI score and rating
  getPSIScore(score?: number): { score: number; rating: 'good' | 'needs-improvement' | 'poor' } {
    if (!score) return { score: 0, rating: 'poor' };
    const percentage = Math.round(score * 100);
    let rating: 'good' | 'needs-improvement' | 'poor' = 'poor';
    
    if (percentage >= 90) rating = 'good';
    else if (percentage >= 50) rating = 'needs-improvement';
    
    return { score: percentage, rating };
  },

  // Format Core Web Vitals metrics
  formatCWV(metric: string, value: number): string {
    switch (metric) {
      case 'LARGEST_CONTENTFUL_PAINT':
      case 'FIRST_CONTENTFUL_PAINT':
        return `${(value / 1000).toFixed(1)}s`;
      case 'INTERACTION_TO_NEXT_PAINT':
        return `${value}ms`;
      case 'CUMULATIVE_LAYOUT_SHIFT':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  }
};

// Legacy exports for backward compatibility
export { createWebsite, generateSitemap, updateDesign, generateFromWithPolling, publishAndFrontWithPolling } from './legacyApi';

export default api;