import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Server, 
  HardDrive,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Clock,
  Info,
  Database,
  Gauge,
  Activity,
  BarChart3
} from 'lucide-react';
import { useTenWebApi } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { useToast } from '@/hooks/use-toast';

interface DashboardAdvancedProps {
  currentWebsite: any;
}

interface InstanceInfo {
  php_version: string;
  memory_limit: string;
  disk_usage: number;
  cpu_usage: number;
  uptime: string;
  last_restart: string;
}

interface StorageInfo {
  total_space: number;
  used_space: number;
  available_space: number;
  database_size: number;
  media_size: number;
  logs_size: number;
}

export function DashboardAdvanced({ currentWebsite }: DashboardAdvancedProps) {
  const { canUseLogs, canUseAdvancedPages } = useFeatureGate();
  const { toast } = useToast();
  const [instanceInfo, setInstanceInfo] = useState<InstanceInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [logs, setLogs] = useState('');
  const [selectedLogType, setSelectedLogType] = useState<'access' | 'error' | 'php'>('error');
  const [logLines, setLogLines] = useState(100);

  const { execute: getInstance, loading: instanceLoading } = useTenWebApi({
    showErrorToast: true
  });

  const { execute: getStorage, loading: storageLoading } = useTenWebApi({
    showErrorToast: true
  });

  const { execute: getLogs, loading: logsLoading } = useTenWebApi({
    showErrorToast: true
  });

  const loadInstanceInfo = async () => {
    if (!currentWebsite?.id) return;
    
    try {
      const response = await getInstance(() => 
        fetch(`/api/tenweb/websites/${currentWebsite.id}/instance-info`)
          .then(res => res.json())
      );
      
      if (response) {
        setInstanceInfo(response);
      }
    } catch (error) {
      // Use mock data for now
      setInstanceInfo({
        php_version: '8.1.27',
        memory_limit: '256M',
        disk_usage: 75,
        cpu_usage: 12,
        uptime: '14 days, 3 hours',
        last_restart: new Date(Date.now() - 86400000 * 14).toISOString()
      });
    }
  };

  const loadStorageInfo = async () => {
    if (!currentWebsite?.id) return;
    
    try {
      const response = await getStorage(() => 
        fetch(`/api/tenweb/websites/${currentWebsite.id}/storage`)
          .then(res => res.json())
      );
      
      if (response) {
        setStorageInfo(response);
      }
    } catch (error) {
      // Use mock data for now
      setStorageInfo({
        total_space: 10737418240, // 10GB
        used_space: 3221225472,   // 3GB
        available_space: 7516192768, // 7GB
        database_size: 104857600,    // 100MB
        media_size: 2147483648,      // 2GB
        logs_size: 52428800          // 50MB
      });
    }
  };

  const loadLogs = async () => {
    if (!currentWebsite?.id) return;
    
    try {
      const response = await getLogs(() => 
        fetch(`/api/tenweb/websites/${currentWebsite.id}/logs?type=${selectedLogType}&lines=${logLines}`)
          .then(res => res.json())
      );
      
      if (response?.logs) {
        setLogs(response.logs);
      }
    } catch (error) {
      // Use mock data for now
      const mockLogs = {
        access: `127.0.0.1 - - [${new Date().toISOString()}] "GET / HTTP/1.1" 200 1234
127.0.0.1 - - [${new Date().toISOString()}] "GET /about HTTP/1.1" 200 5678
127.0.0.1 - - [${new Date().toISOString()}] "POST /contact HTTP/1.1" 200 890`,
        error: `[${new Date().toISOString()}] [error] [client 127.0.0.1] File does not exist: /var/www/html/favicon.ico
[${new Date().toISOString()}] [warn] [client 127.0.0.1] Slow query detected: SELECT * FROM posts WHERE...
[${new Date().toISOString()}] [error] [client 127.0.0.1] PHP Parse error: syntax error in /var/www/html/wp-content/themes/...`,
        php: `[${new Date().toISOString()}] PHP Notice: Undefined variable: test in /var/www/html/wp-content/themes/...
[${new Date().toISOString()}] PHP Warning: Division by zero in /var/www/html/wp-content/plugins/...
[${new Date().toISOString()}] PHP Fatal error: Call to undefined function in /var/www/html/wp-content/...`
      };
      setLogs(mockLogs[selectedLogType]);
    }
  };

  useEffect(() => {
    if (currentWebsite?.id && (canUseLogs || canUseAdvancedPages)) {
      loadInstanceInfo();
      loadStorageInfo();
      if (canUseLogs) {
        loadLogs();
      }
    }
  }, [currentWebsite?.id, canUseLogs, canUseAdvancedPages]);

  useEffect(() => {
    if (canUseLogs && currentWebsite?.id) {
      loadLogs();
    }
  }, [selectedLogType, logLines]);

  if (!canUseLogs && !canUseAdvancedPages) {
    return (
      <LockedFeature
        featureName="Advanced Features"
        description="Access detailed logs, instance information, and storage monitoring"
        requiredPlan="pro"
        onUpgrade={() => window.location.href = '/plans'}
      />
    );
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsageColor = (percentage: number) => {
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const storageUsagePercent = storageInfo ? 
    Math.round((storageInfo.used_space / storageInfo.total_space) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Features</h2>
          <p className="text-muted-foreground">Monitor your website's performance, logs, and system information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              loadInstanceInfo();
              loadStorageInfo();
              if (canUseLogs) loadLogs();
            }} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Instance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Instance Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {instanceLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
            </div>
          ) : instanceInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">PHP Version</span>
                </div>
                <p className="text-lg font-semibold">{instanceInfo.php_version}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Memory Limit</span>
                </div>
                <p className="text-lg font-semibold">{instanceInfo.memory_limit}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <p className={`text-lg font-semibold ${getUsageColor(instanceInfo.cpu_usage)}`}>
                  {instanceInfo.cpu_usage}%
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <p className={`text-lg font-semibold ${getUsageColor(instanceInfo.disk_usage)}`}>
                  {instanceInfo.disk_usage}%
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <p className="text-lg font-semibold">{instanceInfo.uptime}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last Restart</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(instanceInfo.last_restart)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load instance information</p>
          )}
        </CardContent>
      </Card>

      {/* Storage Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storageLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
            </div>
          ) : storageInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Total Space</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formatBytes(storageInfo.total_space)}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Used Space</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatBytes(storageInfo.used_space)}
                  </p>
                  <p className="text-sm text-green-700">{storageUsagePercent}% used</p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Database</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">
                    {formatBytes(storageInfo.database_size)}
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Media Files</span>
                  </div>
                  <p className="text-lg font-bold text-orange-900">
                    {formatBytes(storageInfo.media_size)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(storageInfo.used_space)} / {formatBytes(storageInfo.total_space)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      storageUsagePercent > 80 ? 'bg-red-600' : 
                      storageUsagePercent > 60 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${storageUsagePercent}%` }}
                  ></div>
                </div>
              </div>

              {storageUsagePercent > 80 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Storage usage is high ({storageUsagePercent}%). 
                    Consider cleaning up old files or upgrading your storage plan.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load storage information</p>
          )}
        </CardContent>
      </Card>

      {/* Logs Viewer */}
      {canUseLogs && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Log Viewer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedLogType} onValueChange={(value: any) => setSelectedLogType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="access">Access</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={logLines.toString()} onValueChange={(value) => setLogLines(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing last {logLines} lines from {selectedLogType} log
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadLogs}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <Textarea
                  readOnly
                  value={logs}
                  className="font-mono text-xs bg-gray-50 min-h-[300px]"
                  placeholder={`No ${selectedLogType} logs available`}
                />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Log Types:</strong> Access logs show visitor requests, Error logs show server errors, 
                    and PHP logs show PHP warnings and errors. Use these for troubleshooting issues.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}