import React, { useState, useEffect } from 'react';
import { Globe, Plus, ExternalLink, CheckCircle, XCircle, Clock, AlertTriangle, AlertCircle, Shield, Check, Copy, Trash2, Star, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useDomainManagement } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';

interface DashboardDomainProps {
  currentWebsite: any;
}

export function DashboardDomain({ currentWebsite }: DashboardDomainProps) {
  const { canConnectDomain } = useFeatureGate();
  const [customDomain, setCustomDomain] = useState('');
  const [copied, setCopied] = useState('');
  const { toast } = useToast();
  
  const { 
    listDomains, 
    addDomain, 
    setDefaultDomain, 
    deleteDomain,
    data: domains,
    loading,
    error 
  } = useDomainManagement(currentWebsite?.id || '');

  useEffect(() => {
    if (currentWebsite?.id && canConnectDomain) {
      listDomains();
    }
  }, [currentWebsite?.id, canConnectDomain, listDomains]);

  // Domain connect gating - blocked unless subscription allows
  if (!canConnectDomain) {
    return (
      <LockedFeature
        featureName="Custom Domain"
        description="Connect your custom domain to enhance your brand presence"
        requiredPlan="pro"
        onUpgrade={() => window.location.href = '/plans'}
      />
    );
  }

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
    toast({
      title: 'Copied to clipboard',
      description: `${type} copied successfully`,
    });
  };

  const handleConnectDomain = async () => {
    if (!customDomain.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a domain name',
        variant: 'destructive',
      });
      return;
    }

    if (!currentWebsite?.id) {
      toast({
        title: 'Error',
        description: 'No website selected',
        variant: 'destructive',
      });
      return;
    }

    await addDomain(customDomain.trim());
    setCustomDomain('');
  };

  const handleSetDefault = async (domain: string) => {
    await setDefaultDomain(domain);
  };

  const handleDeleteDomain = async (domain: string) => {
    await deleteDomain(domain);
  };

  const currentDomain = currentWebsite?.site_url || currentWebsite?.subdomain || 'No domain configured';
  const defaultDomain = domains?.find(d => d.default)?.domain || currentDomain;
  
  const dnsRecords = [
    {
      type: 'A',
      name: '@',
      value: '185.158.133.1',
      description: 'Points your root domain to our servers'
    },
    {
      type: 'CNAME',
      name: 'www',
      value: 'cname.vercel-dns.com',
      description: 'Points www subdomain to our servers'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Connected Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Connected Domains
          </CardTitle>
          <CardDescription>
            Manage your website domains and SSL certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : domains && domains.length > 0 ? (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div key={domain.domain} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.domain}</span>
                        {domain.default && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={domain.status === 'active' ? 'default' : 'secondary'}>
                          {domain.status || 'pending'}
                        </Badge>
                        {domain.ssl_enabled && (
                          <Badge variant="outline" className="text-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            SSL
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(`https://${domain.domain}`, 'Domain URL')}
                    >
                      {copied === 'Domain URL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    {!domain.default && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSetDefault(domain.domain)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteDomain(domain.domain)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom domains connected yet</p>
              <p className="text-sm">Add your first domain below to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Domain Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Connect Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Domain Name</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Enter your custom domain (e.g., yourdomain.com)
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="yourdomain.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleConnectDomain}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>DNS Setup Required:</strong> Point your domain to your website by updating DNS records at your domain registrar.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Required DNS Records:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono">A @ 185.158.133.1</span>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy('185.158.133.1', 'IP Address')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono">A www 185.158.133.1</span>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy('185.158.133.1', 'IP Address')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  DNS propagation can take up to 48 hours. Your domain will show as "Pending" until DNS records are properly configured.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNS Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add these DNS records to your domain registrar to connect your custom domain:
          </p>

          <div className="space-y-4">
            {dnsRecords.map((record, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">TYPE</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{record.type}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">NAME</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{record.name}</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCopy(record.name, `${record.type} Name`)}
                      >
                        {copied === `${record.type} Name` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">VALUE</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded break-all">{record.value}</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCopy(record.value, `${record.type} Value`)}
                      >
                        {copied === `${record.type} Value` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <Label className="text-xs text-muted-foreground">STATUS</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{record.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SSL Certificate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SSL Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">SSL Certificate Active</p>
                <p className="text-sm text-green-700">Your website is secured with HTTPS</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Valid
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Certificate Type</Label>
              <p className="font-medium">Let's Encrypt (Free)</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Auto-Renewal</Label>
              <p className="font-medium">Enabled</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Issued Date</Label>
              <p className="font-medium">March 15, 2024</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Expires</Label>
              <p className="font-medium">June 13, 2024</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">SSL Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Encrypts all data transmitted between your website and visitors</li>
              <li>• Improves search engine rankings (SEO boost)</li>
              <li>• Builds trust with your visitors</li>
              <li>• Required for modern web standards</li>
              <li>• Automatically renews before expiration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}