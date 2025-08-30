import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  action: string;
  website_id?: string;
  user_id?: string;
  result: 'success' | 'error';
  details?: Record<string, any>;
  error_message?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create audit log entry
      const logEntry = {
        action: entry.action,
        website_id: entry.website_id,
        user_id: entry.user_id || user?.id,
        result: entry.result,
        details: entry.details ? JSON.stringify(entry.details) : null,
        error_message: entry.error_message,
        created_at: new Date().toISOString()
      };

      // Insert into action_logs table
      const { error } = await supabase
        .from('action_logs')
        .insert({
          role: 'user',
          path: window.location.pathname,
          method: 'POST',
          user_id: logEntry.user_id || '00000000-0000-0000-0000-000000000000',
          status: entry.result === 'success' ? 200 : 500
        });

      if (error) {
        console.warn('Failed to write audit log:', error);
      }
    } catch (error) {
      console.warn('Audit logging failed:', error);
    }
  }

  // Convenience methods for common actions
  async logDomainAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `domain_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logSSLAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `ssl_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logBackupAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `backup_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logStagingAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `staging_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logCacheAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `cache_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logPHPAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `php_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logSecurityAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `security_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logPagesAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `pages_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logStoreAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `store_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logFormsAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `forms_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }

  async logAutomationAction(action: string, websiteId: string, result: 'success' | 'error', details?: any, error?: string) {
    await this.log({
      action: `automation_${action}`,
      website_id: websiteId,
      result,
      details,
      error_message: error
    });
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();