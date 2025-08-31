import { useState } from 'react';
import { tenwebFetch } from '@/lib/tenweb';
import { useToast } from '@/hooks/use-toast';

interface UseTenWebApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseTenWebApiOptions {
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useTenWebApi<T = any>(options: UseTenWebApiOptions = {}) {
  const [state, setState] = useState<UseTenWebApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const { toast } = useToast();

  const execute = async (apiCall: () => Promise<any>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      
      if ((options.showToast || options.showSuccessToast) && options.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || options.errorMessage || 'Operation failed';
      setState({ data: null, loading: false, error: errorMessage });
      
      if (options.showToast || options.showErrorToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return { ...state, execute, reset };
}

// Simplified API hooks for backward compatibility
export function useDomainManagement(websiteId: string) {
  const api = useTenWebApi({ showToast: true });
  
  const listDomains = () => api.execute(() => 
    tenwebFetch(`/v1/hosting/websites/${websiteId}/domains`)
  );
  
  const addDomain = (domain: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/domains`, {
      method: 'POST',
      body: { domain }
    })
  );
  
  const setDefaultDomain = (domain: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/domains/default`, {
      method: 'PUT',
      body: { domain }
    })
  );
  
  const deleteDomain = (domain: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/domains/${domain}`, {
      method: 'DELETE'
    })
  );
  
  return { ...api, listDomains, addDomain, setDefaultDomain, deleteDomain };
}

export function useWordPressAdmin(websiteId: string) {
  const api = useTenWebApi({ showToast: true });
  
  const generateAdminToken = (adminUrl?: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/wp-admin-token`, {
      method: 'POST',
      body: adminUrl ? { admin_url: adminUrl } : {}
    })
  );
  
  return { ...api, generateAdminToken };
}

export function useBackupManagement(websiteId: string) {
  const api = useTenWebApi({ showToast: true });
  
  const listBackups = () => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/backups`)
  );
  
  const runBackup = () => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/backups`, {
      method: 'POST'
    })
  );
  
  const restoreBackup = (backupId: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/backups/${backupId}/restore`, {
      method: 'POST'
    })
  );
  
  return { ...api, listBackups, runBackup, restoreBackup };
}

export function useCacheManagement(websiteId: string) {
  const api = useTenWebApi({ showToast: true });
  
  const purgeCache = (force?: boolean) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/cache/purge`, {
      method: 'POST',
      body: force ? { force } : {}
    })
  );
  
  const enableCache = (ttl?: number) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/cache`, {
      method: 'PUT',
      body: { enabled: true, ttl }
    })
  );
  
  const disableCache = () => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/cache`, {
      method: 'PUT',
      body: { enabled: false }
    })
  );
  
  const toggleObjectCache = (enabled?: boolean) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/cache/object`, {
      method: 'PUT',
      body: { enabled: enabled !== undefined ? enabled : true }
    })
  );
  
  const flushObjectCache = () => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/cache/object/flush`, {
      method: 'POST'
    })
  );
  
  return { ...api, purgeCache, enableCache, disableCache, toggleObjectCache, flushObjectCache };
}

export function useSecurityManagement(websiteId: string) {
  const api = useTenWebApi({ showToast: true });
  
  const togglePasswordProtection = (enabled: boolean) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/security/password-protection`, {
      method: 'PUT',
      body: { enabled }
    })
  );
  
  const whitelistIP = (ip: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/security/whitelist`, {
      method: 'POST',
      body: { ip }
    })
  );
  
  return { ...api, togglePasswordProtection, whitelistIP };
}

export function usePagesManagement(websiteId: string) {
  const api = useTenWebApi({ showToast: true });
  
  const listPages = () => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/pages`)
  );
  
  const addBlankPage = (title: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/pages`, {
      method: 'POST',
      body: { title, type: 'blank' }
    })
  );
  
  const deletePages = (pageIds: string[]) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/pages/batch`, {
      method: 'DELETE',
      body: { pageIds }
    })
  );
  
  const publishPages = (pageIds: string[]) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/pages/publish`, {
      method: 'POST',
      body: { pageIds }
    })
  );
  
  const setFrontPage = (pageId: string) => api.execute(() =>
    tenwebFetch(`/v1/hosting/websites/${websiteId}/pages/${pageId}/front`, {
      method: 'PUT'
    })
  );
  
  return { ...api, listPages, addBlankPage, deletePages, publishPages, setFrontPage };
}