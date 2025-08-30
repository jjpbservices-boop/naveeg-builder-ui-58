import { useState, useCallback } from 'react'
import { tenwebApi, TenWebApiError, TenWebResponse } from '@/lib/tenwebApi'
import { useToast } from '@/hooks/use-toast'
import { auditLogger } from '@/lib/auditLogger'

interface UseTenWebApiState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseTenWebApiOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  onSuccess?: (data: any) => void
  onError?: (error: TenWebApiError) => void
}

export function useTenWebApi<T = any>(options: UseTenWebApiOptions = {}) {
  const [state, setState] = useState<UseTenWebApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const { toast } = useToast()
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError
  } = options

  const execute = useCallback(async (
    apiCall: () => Promise<TenWebResponse<T>>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()
      
      if (!response.success) {
        throw new TenWebApiError(
          response.error || response.message || 'API request failed',
          400,
          'API_ERROR',
          response
        )
      }

      setState({
        data: response.data || null,
        loading: false,
        error: null
      })

      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default'
        })
      }

      onSuccess?.(response.data)
      return response.data || null

    } catch (error) {
      const apiError = error instanceof TenWebApiError 
        ? error 
        : new TenWebApiError('Unexpected error occurred', 500, 'UNKNOWN_ERROR')

      setState({
        data: null,
        loading: false,
        error: apiError.message
      })

      if (showErrorToast) {
        toast({
          title: 'Error',
          description: apiError.message,
          variant: 'destructive'
        })
      }

      onError?.(apiError)
      return null
    }
  }, [toast, showSuccessToast, showErrorToast, successMessage, onSuccess, onError])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

// Specific hooks for common operations
export function useDomainManagement(websiteId: string) {
  const { execute, ...state } = useTenWebApi({
    showSuccessToast: true,
    showErrorToast: true
  })

  const listDomains = useCallback(() => 
    execute(() => tenwebApi.listDomains(websiteId)), [execute, websiteId])

  const addDomain = useCallback(async (domain: string) => {
    const result = await execute(() => tenwebApi.addDomain(websiteId, domain));
    await auditLogger.logDomainAction('add', websiteId, result ? 'success' : 'error', { domain });
    return result;
  }, [execute, websiteId])

  const setDefaultDomain = useCallback(async (domainId: string) => {
    const result = await execute(() => tenwebApi.setDefaultDomain(websiteId, domainId));
    await auditLogger.logDomainAction('set_default', websiteId, result ? 'success' : 'error', { domainId });
    return result;
  }, [execute, websiteId])

  const deleteDomain = useCallback(async (domainId: string) => {
    const result = await execute(() => tenwebApi.deleteDomain(websiteId, domainId));
    await auditLogger.logDomainAction('delete', websiteId, result ? 'success' : 'error', { domainId });
    return result;
  }, [execute, websiteId])

  return {
    ...state,
    listDomains,
    addDomain,
    setDefaultDomain,
    deleteDomain
  }
}

export function useWordPressAdmin(websiteId: string) {
  const { execute, ...state } = useTenWebApi({
    showErrorToast: true
  })

  const generateAdminToken = useCallback((adminUrl: string) => 
    execute(() => tenwebApi.generateAdminToken(websiteId, adminUrl)), [execute, websiteId])

  return {
    ...state,
    generateAdminToken
  }
}

export function useAnalytics(websiteId: string) {
  const { execute, ...state } = useTenWebApi({
    showErrorToast: true
  })

  const getVisitors = useCallback((period: 'day' | 'week' | 'month' | 'year') => 
    execute(() => tenwebApi.getVisitors(websiteId, period)), [execute, websiteId])

  return {
    ...state,
    getVisitors
  }
}

export function useBackupManagement(websiteId: string) {
  const { execute, ...state } = useTenWebApi({
    showSuccessToast: true,
    showErrorToast: true
  })

  const listBackups = useCallback(() => 
    execute(() => tenwebApi.listBackups(websiteId)), [execute, websiteId])

  const runBackup = useCallback(async () => {
    const result = await execute(() => tenwebApi.runBackup(websiteId));
    await auditLogger.logBackupAction('create', websiteId, result ? 'success' : 'error');
    return result;
  }, [execute, websiteId])

  const restoreBackup = useCallback(async (backupId: string) => {
    const result = await execute(() => tenwebApi.restoreBackup(websiteId, backupId));
    await auditLogger.logBackupAction('restore', websiteId, result ? 'success' : 'error', { backupId });
    return result;
  }, [execute, websiteId])

  return {
    ...state,
    listBackups,
    runBackup,
    restoreBackup
  }
}

export function useCacheManagement(websiteId: string) {
  const { execute, ...state } = useTenWebApi({
    showSuccessToast: true,
    showErrorToast: true
  })

  const enableCache = useCallback(async (ttl?: number) => {
    const result = await execute(() => tenwebApi.enableCache(websiteId, ttl));
    await auditLogger.logCacheAction('enable', websiteId, result ? 'success' : 'error', { ttl });
    return result;
  }, [execute, websiteId])

  const disableCache = useCallback(async () => {
    const result = await execute(() => tenwebApi.disableCache(websiteId));
    await auditLogger.logCacheAction('disable', websiteId, result ? 'success' : 'error');
    return result;
  }, [execute, websiteId])

  const purgeCache = useCallback(async (recache?: boolean) => {
    const result = await execute(() => tenwebApi.purgeCache(websiteId, recache));
    await auditLogger.logCacheAction('purge', websiteId, result ? 'success' : 'error', { recache });
    return result;
  }, [execute, websiteId])

  const toggleObjectCache = useCallback(async () => {
    const result = await execute(() => tenwebApi.toggleObjectCache(websiteId));
    await auditLogger.logCacheAction('toggle_object', websiteId, result ? 'success' : 'error');
    return result;
  }, [execute, websiteId])

  const flushObjectCache = useCallback(async () => {
    const result = await execute(() => tenwebApi.flushObjectCache(websiteId));
    await auditLogger.logCacheAction('flush_object', websiteId, result ? 'success' : 'error');
    return result;
  }, [execute, websiteId])

  return {
    ...state,
    enableCache,
    disableCache,
    purgeCache,
    toggleObjectCache,
    flushObjectCache
  }
}

export function useSecurityManagement(websiteId: string) {
  const { execute, ...state } = useTenWebApi({
    showSuccessToast: true,
    showErrorToast: true
  })

  const togglePasswordProtection = useCallback((enabled: boolean, password?: string) => 
    execute(() => tenwebApi.togglePasswordProtection(websiteId, enabled ? 'enable' : 'disable')), [execute, websiteId])

  const updateIpWhitelist = useCallback((ipAddress: string) => 
    execute(() => tenwebApi.whitelistIP(websiteId, ipAddress)), [execute, websiteId])

  return {
    ...state,
    togglePasswordProtection,
    updateIpWhitelist
  }
}

export function usePagesManagement(websiteId: string) {
  const { execute, ...state } = useTenWebApi({
    showSuccessToast: true,
    showErrorToast: true
  })

  const listPages = useCallback(() => 
    execute(() => tenwebApi.listPages(websiteId)), [execute, websiteId])

  const addBlankPage = useCallback((title: string, content?: string) => 
    execute(() => tenwebApi.addBlankPage(websiteId, title)), [execute, websiteId])

  const deletePages = useCallback((pageIds: string[]) => 
    execute(() => tenwebApi.deletePages(websiteId, pageIds)), [execute, websiteId])

  const publishPages = useCallback((pageIds: string[], status: 'publish' | 'draft') => 
    execute(() => tenwebApi.publishPages(websiteId, pageIds, status)), [execute, websiteId])

  const setFrontPage = useCallback((pageId: string) => 
    execute(() => tenwebApi.setFrontPage(websiteId, pageId)), [execute, websiteId])

  return {
    ...state,
    listPages,
    addBlankPage,
    deletePages,
    publishPages,
    setFrontPage
  }
}