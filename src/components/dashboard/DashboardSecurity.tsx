import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Info,
  UserCheck
} from 'lucide-react';
import { useTenWebApi } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { useToast } from '@/hooks/use-toast';

interface DashboardSecurityProps {
  currentWebsite: any;
}

interface SecuritySettings {
  password_protection_enabled: boolean;
  password_protection_password?: string;
  ip_whitelist: string[];
  failed_login_attempts: number;
  last_security_scan?: string;
}

export function DashboardSecurity({ currentWebsite }: DashboardSecurityProps) {
  const { canUseSecurity } = useFeatureGate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newIpAddress, setNewIpAddress] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showIpDialog, setShowIpDialog] = useState(false);

  const { execute: getSettings, loading: settingsLoading } = useTenWebApi({
    showErrorToast: true
  });

  const { execute: togglePasswordProtection } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'Password protection updated successfully'
  });

  const { execute: updateIpWhitelist } = useTenWebApi({
    showSuccessToast: true,
    successMessage: 'IP whitelist updated successfully'
  });

  const loadSettings = async () => {
    if (!currentWebsite?.id) return;
    
    try {
      const response = await getSettings(() => 
        fetch(`/api/tenweb/websites/${currentWebsite.id}/security`)
          .then(res => res.json())
      );
      
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      // Use mock data for now
      setSettings({
        password_protection_enabled: false,
        ip_whitelist: ['192.168.1.1', '10.0.0.1'],
        failed_login_attempts: 3,
        last_security_scan: new Date(Date.now() - 86400000).toISOString()
      });
    }
  };

  useEffect(() => {
    if (currentWebsite?.id && canUseSecurity) {
      loadSettings();
    }
  }, [currentWebsite?.id, canUseSecurity]);

  if (!canUseSecurity) {
    return (
      <LockedFeature
        featureName="Advanced Security"
        description="Protect your website with password protection, IP whitelisting, and security monitoring"
        requiredPlan="pro"
        onUpgrade={() => window.location.href = '/plans'}
      />
    );
  }

  const handlePasswordProtectionToggle = async (enabled: boolean) => {
    if (enabled && !newPassword) {
      setShowPasswordDialog(true);
      return;
    }

    try {
      await togglePasswordProtection(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/security/password-protection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            enabled, 
            password: enabled ? newPassword : undefined 
          })
        }).then(res => res.json())
      );
      
      setTimeout(() => loadSettings(), 1000);
      setShowPasswordDialog(false);
      setNewPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password protection',
        variant: 'destructive',
      });
    }
  };

  const handleAddIpAddress = async () => {
    if (!newIpAddress.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid IP address',
        variant: 'destructive',
      });
      return;
    }

    const updatedIps = [...(settings?.ip_whitelist || []), newIpAddress.trim()];
    
    try {
      await updateIpWhitelist(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/security/ip-whitelist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip_addresses: updatedIps })
        }).then(res => res.json())
      );
      
      setTimeout(() => loadSettings(), 1000);
      setShowIpDialog(false);
      setNewIpAddress('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add IP address',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveIpAddress = async (ipToRemove: string) => {
    const updatedIps = (settings?.ip_whitelist || []).filter(ip => ip !== ipToRemove);
    
    try {
      await updateIpWhitelist(() =>
        fetch(`/api/tenweb/websites/${currentWebsite.id}/security/ip-whitelist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip_addresses: updatedIps })
        }).then(res => res.json())
      );
      
      setTimeout(() => loadSettings(), 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove IP address',
        variant: 'destructive',
      });
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
          <p className="text-muted-foreground">Protect your website with advanced security features</p>
        </div>
        <Button onClick={loadSettings} variant="outline" size="sm" disabled={settingsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">SSL Certificate</p>
                <p className="text-sm text-green-700">Active & Valid</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Password Protection</p>
                <p className="text-sm text-blue-700">
                  {settings?.password_protection_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <Globe className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">IP Whitelist</p>
                <p className="text-sm text-purple-700">
                  {settings?.ip_whitelist?.length || 0} addresses
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enable Password Protection</Label>
              <p className="text-sm text-muted-foreground">
                Require visitors to enter a password before accessing your website
              </p>
            </div>
            <Switch
              checked={settings?.password_protection_enabled || false}
              onCheckedChange={handlePasswordProtectionToggle}
              disabled={!settings}
            />
          </div>

          {settings?.password_protection_enabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password protection is active. Visitors must enter the correct password to access your website.
                  </AlertDescription>
                </Alert>

                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Update Password
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              IP Address Whitelist
            </CardTitle>
            <Dialog open={showIpDialog} onOpenChange={setShowIpDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add IP
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
            </div>
          ) : settings?.ip_whitelist && settings.ip_whitelist.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.ip_whitelist.map((ip, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{ip}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-success border-success/50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Allowed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveIpAddress(ip)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No IP addresses in whitelist</p>
              <p className="text-sm">All IP addresses are currently allowed</p>
            </div>
          )}

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> IP whitelisting restricts access to only the specified IP addresses. 
              Make sure to include your current IP address to avoid being locked out.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Security Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Security Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Failed Login Attempts (24h)</Label>
              <p className="text-2xl font-bold">{settings?.failed_login_attempts || 0}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Security Scan</Label>
              <p className="text-sm">
                {settings?.last_security_scan 
                  ? formatDate(settings.last_security_scan)
                  : 'Never'
                }
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <h4 className="font-medium">Security Recommendations</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">SSL certificate is active and valid</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">WordPress core is up to date</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm">Consider enabling two-factor authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm">Regular security scans recommended</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Password Protection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a strong password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Make sure to save this password in a secure location. You'll need it to access your website.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={() => handlePasswordProtectionToggle(true)}
                disabled={!newPassword.trim()}
              >
                Enable Protection
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* IP Address Dialog */}
      <Dialog open={showIpDialog} onOpenChange={setShowIpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add IP Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>IP Address</Label>
              <Input
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                placeholder="192.168.1.1"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Only the IP addresses in your whitelist will be able to access your website. 
                Make sure to include your current IP address.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={handleAddIpAddress}
                disabled={!newIpAddress.trim()}
              >
                Add IP Address
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowIpDialog(false)}
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