// Generated TypeScript types from 10Web OpenAPI specification
// This file contains type definitions for the 10Web API endpoints

export interface TenWebApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// ========== AI ENDPOINTS ==========

export interface GenerateSitemapRequest {
  business_description: string;
  business_type: string;
  website_title: string;
  website_description: string;
  website_keyphrase: string;
}

export interface GenerateSitemapResponse {
  sitemap_id: string;
  sitemap: {
    pages: SitemapPage[];
    structure: any;
  };
  pages: SitemapPage[];
}

export interface SitemapPage {
  title: string;
  description: string;
  url: string;
  type: 'home' | 'about' | 'services' | 'contact' | 'blog' | 'page';
  parent?: string;
}

export interface CreateSiteFromSitemapRequest {
  sitemap_id: string;
  design_preferences?: {
    primary_color?: string;
    secondary_color?: string;
    heading_font?: string;
    body_font?: string;
  };
}

export interface CreateAiWebsiteRequest {
  business_description: string;
  business_type: string;
  website_title: string;
  website_description: string;
  website_keyphrase: string;
  design_preferences?: {
    primary_color?: string;
    secondary_color?: string;
    heading_font?: string;
    body_font?: string;
  };
}

export interface WebsiteCreationResponse {
  website_id: number;
  site_url: string;
  admin_url: string;
  subdomain: string;
  status: 'creating' | 'active' | 'error';
  progress?: number;
}

// ========== HOSTING ENDPOINTS ==========

export interface WebsiteDetailsRequest {
  website_id: number;
  admin_url?: boolean;
}

export interface WebsiteDetailsResponse {
  website_id: number;
  name: string;
  site_url: string;
  admin_url: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  region: string;
  created_at: string;
  updated_at: string;
  wp_admin_url?: string;
  token?: string;
}

// ========== WORDPRESS MANAGEMENT ==========

export interface WordPressLoginTokenResponse {
  token: string;
  wp_admin_url: string;
  expires_at: string;
}

export interface PageCreateRequest {
  title: string;
  content: string;
  status: 'publish' | 'draft' | 'private';
  parent_id?: number;
  template?: string;
}

export interface PageUpdateRequest {
  id: number;
  title?: string;
  content?: string;
  status?: 'publish' | 'draft' | 'private';
  parent_id?: number;
}

export interface PageResponse {
  id: number;
  title: string;
  content: string;
  status: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface PagesListResponse {
  pages: PageResponse[];
  total: number;
  page: number;
  per_page: number;
}

// ========== DOMAIN MANAGEMENT ==========

export interface DomainAddRequest {
  domain: string;
  website_id: number;
}

export interface DomainResponse {
  id: number;
  domain: string;
  website_id: number;
  status: 'active' | 'pending' | 'failed';
  is_primary: boolean;
  ssl_status: 'active' | 'pending' | 'failed';
  created_at: string;
}

export interface DnsRecordRequest {
  domain: string;
  type: 'A' | 'CNAME' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
}

export interface DnsRecordResponse {
  id: number;
  domain: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
  created_at: string;
}

// ========== CACHE MANAGEMENT ==========

export interface CacheControlRequest {
  website_id: number;
  action: 'enable' | 'disable' | 'purge';
  cache_type: 'fastcgi' | 'object';
}

export interface CacheStatusResponse {
  website_id: number;
  fastcgi_cache: {
    enabled: boolean;
    size: string;
    hit_rate: number;
  };
  object_cache: {
    enabled: boolean;
    type: 'redis' | 'memcached';
    status: 'active' | 'inactive';
  };
}

// ========== PHP MANAGEMENT ==========

export interface PhpVersionRequest {
  website_id: number;
  version: '7.4' | '8.0' | '8.1' | '8.2' | '8.3';
}

export interface PhpStatusResponse {
  website_id: number;
  current_version: string;
  available_versions: string[];
  status: 'active' | 'updating';
  last_restart: string;
}

// ========== LOG MANAGEMENT ==========

export interface LogsRequest {
  website_id: number;
  type: 'access' | 'error' | 'php';
  lines?: number;
  since?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export interface LogsResponse {
  website_id: number;
  type: string;
  entries: LogEntry[];
  total_lines: number;
}

// ========== ERROR TYPES ==========

export interface TenWebError {
  code: string;
  message: string;
  details?: any;
}

export interface TenWebErrorResponse {
  success: false;
  error: TenWebError;
}