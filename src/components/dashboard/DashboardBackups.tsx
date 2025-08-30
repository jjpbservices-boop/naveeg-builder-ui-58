import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Shield, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Copy,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';
import { useBackupManagement } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { useToast } from '@/hooks/use-toast';

interface DashboardBackupsProps {
  currentWebsite: any;
}

interface Backup {
  id: string;
  created_at: string;
  size: number;
  type: 'manual' | 'automatic';
  status: 'completed' | 'running' | 'failed';
  description?: string;
}

export function DashboardBackups({ currentWebsite }: DashboardBackupsProps) {
  const { canUseBackups } = useFeatureGate();
  const { toast } = useToast();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  const {
    listBackups,
    runBackup,
    restoreBackup,
    data: backupsData,
    loading,
    error
  } = useBackupManagement(currentWebsite?.id || '');

  useEffect(() => {
    if (currentWebsite?.id && canUseBackups) {
      listBackups();
    }
  }, [currentWebsite?.id, canUseBackups, listBackups]);

  // Feature gating
  if (!canUseBackups) {
    return (
      <LockedFeature
        featureName="Backups & Staging"
        description="Protect your website with automated backups and staging environments"
        requiredPlan="pro"
        onUpgrade={() => window.location.href = '/plans'}
      />
    );
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await runBackup();
      toast({
        title: 'Backup Created',
        description: 'Website backup has been created successfully',
      });
      // Refresh the list
      setTimeout(() => listBackups(), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create backup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backup: Backup) => {
    try {
      await restoreBackup(backup.id);
      toast({
        title: 'Restore Started',
        description: 'Website restoration has been initiated. This may take a few minutes.',
      });
      setShowRestoreDialog(false);
      setSelectedBackup(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore backup. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-success border-success/50"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'running':
        return <Badge variant="outline" className="text-warning border-warning/50"><Clock className="h-3 w-3 mr-1" />Running</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-destructive border-destructive/50"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const mockBackups: Backup[] = [
    {
      id: '1',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      size: 245760000,
      type: 'automatic',
      status: 'completed',
      description: 'Daily automatic backup'
    },
    {
      id: '2', 
      created_at: new Date(Date.now() - 172800000).toISOString(),
      size: 198432000,
      type: 'manual',
      status: 'completed',
      description: 'Pre-update backup'
    }
  ];

  const backups = backupsData || mockBackups;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Backups & Staging</h2>
          <p className="text-muted-foreground">Protect your website with automated backups and staging environments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => listBackups()} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingBackup ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      {/* Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Website Backups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                <span className="text-muted-foreground">Loading backups...</span>
              </div>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Backups Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first backup to protect your website data.</p>
              <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Backup
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">
                      {formatDate(backup.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={backup.type === 'automatic' ? 'secondary' : 'outline'}>
                        {backup.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(backup.size)}</TableCell>
                    <TableCell>{getStatusBadge(backup.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {backup.description || 'Manual backup'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreDialog(true);
                          }}
                          disabled={backup.status !== 'completed'}
                        >
                          Restore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Staging Environment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Staging Environment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Staging environments let you test changes safely before deploying to your live website.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Live Website</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentWebsite?.site_url || 'Not available'}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={currentWebsite?.site_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Staging Website</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Staging not enabled</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                Enable Staging
              </Button>
              <Button variant="outline" disabled>
                Push to Staging
              </Button>
              <Button variant="outline" disabled>
                Push to Live
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Website Backup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will overwrite your current website with the backup data. 
                This action cannot be undone. Consider creating a backup of your current site first.
              </AlertDescription>
            </Alert>
            
            {selectedBackup && (
              <div className="space-y-2">
                <p><strong>Backup Date:</strong> {formatDate(selectedBackup.created_at)}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedBackup.size)}</p>
                <p><strong>Type:</strong> {selectedBackup.type}</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-4">
              <Button 
                variant="destructive" 
                onClick={() => selectedBackup && handleRestoreBackup(selectedBackup)}
              >
                Restore Backup
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRestoreDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}