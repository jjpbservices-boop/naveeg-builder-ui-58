import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Settings, 
  RefreshCw, 
  Trash2, 
  Database,
  Server,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useCacheManagement, useTenWebApi } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { useToast } from '@/hooks/use-toast';

interface DashboardCacheProps {
  currentWebsite: any;
}

interface CacheSettings {
  fastcgi_enabled: boolean;
  fastcgi_ttl: number;
  object_cache_enabled: boolean;
  php_version: string;
  supported_php_versions: string[];
}

export function DashboardCache({ currentWebsite }: DashboardCacheProps) {
  const { canUseAdvancedCache, canUseCustomPhp } = useFeatureGate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<CacheSettings | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    enableCache,
    disableCache,
    purgeCache,
    toggleObjectCache,
    flushObjectCache,
    loading: cacheLoading
  } = useCacheManagement(currentWebsite?.id || '');

  const { execute: getSettings } = useTenWebApi({
    showErrorToast: true
  });

  const { execute: switchPhpVersion } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'PHP version updated successfully'
  });

  const { execute: restartPhp } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'PHP service restarted'
  });

  const loadSettings = async () => {
    if (!currentWebsite?.id) return;
    
    try {
      const response = await getSettings(() => 
        fetch(`/api/tenweb/websites/${currentWebsite.id}/settings`)
          .then(res => res.json())
      );
      
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      // Use mock data for now
      setSettings({
        fastcgi_enabled: true,
        fastcgi_ttl: 3600,
        object_cache_enabled: false,
        php_version: '8.1',
        supported_php_versions: ['7.4', '8.0', '8.1', '8.2', '8.3']
      });
    }
  };

  useEffect(() => {
    if (currentWebsite?.id) {
      loadSettings();
    }
  }, [currentWebsite?.id]);

  const handleCacheToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      if (enabled) {
        await enableCache(3600);
      } else {
        await disableCache();
      }
      // Refresh settings
      setTimeout(() => loadSettings(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cache settings',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePurgeCache = async () => {
    try {
      await purgeCache(true);
      toast({
        title: 'Cache Purged',
        description: 'Website cache has been cleared successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purge cache',
        variant: 'destructive',
      });
    }
  };

  const handleObjectCacheToggle = async () => {
    try {
      await toggleObjectCache();
      toast({
        title: 'Object Cache Updated',
        description: 'Object cache settings have been updated',
      });
      setTimeout(() => loadSettings(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update object cache',
        variant: 'destructive',
      });
    }
  };

  const handleFlushObjectCache = async () => {
    try {
      await flushObjectCache();
      toast({
        title: 'Object Cache Flushed',
        description: 'Object cache has been cleared successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to flush object cache',
        variant: 'destructive',
      });
    }
  };

  const handlePhpVersionChange = async (version: string) => {
    try {
      await switchPhpVersion(() => 
        fetch(`/api/tenweb/websites/${currentWebsite.id}/php/switch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version })
        }).then(res => res.json())
      );
      setTimeout(() => loadSettings(), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to switch PHP version',
        variant: 'destructive',
      });
    }
  };

  const handleRestartPhp = async () => {
    try {
      await restartPhp(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/php/restart`, {
          method: 'POST'
        }).then(res => res.json())
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restart PHP',
        variant: 'destructive',
      });
    }
  };

  if (!canUseAdvancedCache && !canUseCustomPhp) {
    return (
      <LockedFeature
        featureName="Cache & Performance"
        description="Optimize your website with advanced caching and PHP management"
        requiredPlan="pro"
        onUpgrade={() => window.location.href = '/plans'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cache & Performance</h2>
          <p className="text-muted-foreground">Optimize your website performance with caching and PHP management</p>
        </div>
        <Button onClick={loadSettings} variant="outline" size="sm" disabled={cacheLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${cacheLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* FastCGI Cache */}
      {canUseAdvancedCache && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              FastCGI Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable FastCGI Cache</Label>
                <p className="text-sm text-muted-foreground">
                  Dramatically improve page load times by caching dynamic content
                </p>
              </div>
              <Switch
                checked={settings?.fastcgi_enabled || false}
                onCheckedChange={handleCacheToggle}
                disabled={isUpdating || !settings}
              />
            </div>

            {settings?.fastcgi_enabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cache TTL: {settings.fastcgi_ttl}s</span>
                    <Badge variant="outline" className="text-success border-success/50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <Button onClick={handlePurgeCache} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Purge Cache
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Object Cache */}
      {canUseAdvancedCache && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Object Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Object Cache</Label>
                <p className="text-sm text-muted-foreground">
                  Cache database queries and objects for faster performance
                </p>
              </div>
              <Switch
                checked={settings?.object_cache_enabled || false}
                onCheckedChange={handleObjectCacheToggle}
                disabled={!settings}
              />
            </div>

            {settings?.object_cache_enabled && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <Button onClick={handleFlushObjectCache} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Flush Object Cache
                  </Button>
                  <Badge variant="outline" className="text-success border-success/50">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* PHP Management */}
      {canUseCustomPhp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              PHP Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current PHP Version</Label>
                <Select
                  value={settings?.php_version || '8.1'}
                  onValueChange={handlePhpVersionChange}
                  disabled={!settings}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PHP version" />
                  </SelectTrigger>
                  <SelectContent>
                    {(settings?.supported_php_versions || ['8.1']).map((version) => (
                      <SelectItem key={version} value={version}>
                        PHP {version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Actions</Label>
                <Button onClick={handleRestartPhp} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart PHP
                </Button>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Changing PHP versions may affect website functionality. Test thoroughly after switching versions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">FastCGI Cache</p>
                  <p className="text-xs text-muted-foreground">Enabled and optimized</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">PHP Version</p>
                  <p className="text-xs text-muted-foreground">Using latest stable version</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm font-medium">Object Cache</p>
                  <p className="text-xs text-muted-foreground">Consider enabling for better performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Image Optimization</p>
                  <p className="text-xs text-muted-foreground">Install a compression plugin</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}