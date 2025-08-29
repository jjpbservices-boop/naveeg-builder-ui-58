import React, { useState, useEffect } from 'react';
import { Globe, Plus, ExternalLink, CheckCircle, XCircle, Clock, AlertTriangle, AlertCircle, Shield, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { LockedFeature } from '../LockedFeature';

interface DashboardDomainProps {
  currentWebsite: any;
}

export function DashboardDomain({ currentWebsite }: DashboardDomainProps) {
  const { canConnectDomain, isSubscriptionActive } = useSubscription();
  const [customDomain, setCustomDomain] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState('');
  const { toast } = useToast();

  // Domain connect gating - blocked unless active/past_due subscription
  if (!canConnectDomain()) {
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

    setIsConnecting(true);
    try {
      // Get current site ID
      const siteId = localStorage.getItem('currentSiteId');
      if (!siteId) {
        throw new Error('No site selected');
      }

      // Check domain gate first
      const { data: gateResponse, error: gateError } = await supabase.functions.invoke('domain-gate', {
        body: { site_id: siteId },
        headers: { 'Content-Type': 'application/json' },
      });

      if (gateError || !gateResponse?.allowed) {
        throw new Error(gateResponse?.reason || 'Domain connection not allowed');
      }

      // Simulate domain connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Domain Connection Initiated',
        description: 'Please configure the DNS records shown below to complete the setup.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect domain. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const currentDomain = currentWebsite?.site_url || currentWebsite?.subdomain || 'No domain configured';
  
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
      {/* Current Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Current Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Primary Domain</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input 
                value={currentDomain}
                readOnly 
                className="flex-1"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCopy(currentDomain, 'Domain URL')}
              >
                {copied === 'Domain URL' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {currentWebsite?.site_url && (
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <a href={currentWebsite.site_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                SSL Status: Active
              </Button>
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
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-accent/50 rounded-lg border">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Custom Domain Requirements</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Domain must be registered and active</li>
                  <li>• You need access to DNS settings</li>
                  <li>• SSL certificate will be automatically provisioned</li>
                  <li>• Setup typically takes 24-48 hours</li>
                </ul>
              </div>
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