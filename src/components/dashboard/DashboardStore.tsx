import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Store, 
  FileText, 
  Zap, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Settings,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  Info,
  AlertTriangle,
  Webhook,
  Globe
} from 'lucide-react';
import { useWordPressAdmin } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { useToast } from '@/hooks/use-toast';

interface DashboardStoreProps {
  currentWebsite: any;
}

interface StoreSettings {
  woocommerce_enabled: boolean;
  store_setup_completed: boolean;
  products_count: number;
  orders_count: number;
  revenue_total: number;
  currency: string;
}

export function DashboardStore({ currentWebsite }: DashboardStoreProps) {
  const { canUseStore, canUseForms, canUseAutomations } = useFeatureGate();
  const { toast } = useToast();
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [isEnablingStore, setIsEnablingStore] = useState(false);
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  const [showZapierDialog, setShowZapierDialog] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const {
    generateAdminToken,
    data: adminToken,
    loading,
    error
  } = useWordPressAdmin(currentWebsite?.id || '');

  const loadStoreSettings = async () => {
    if (!currentWebsite?.id) return;
    
    try {
      // Mock store data for now
      setStoreSettings({
        woocommerce_enabled: false,
        store_setup_completed: false,
        products_count: 0,
        orders_count: 0,
        revenue_total: 0,
        currency: 'USD'
      });
    } catch (error) {
      console.error('Failed to load store settings:', error);
    }
  };

  useEffect(() => {
    if (currentWebsite?.id && canUseStore) {
      loadStoreSettings();
    }
  }, [currentWebsite?.id, canUseStore]);

  const handleEnableStore = async () => {
    if (!currentWebsite?.id) {
      toast({
        title: 'Error',
        description: 'No website selected',
        variant: 'destructive',
      });
      return;
    }

    setIsEnablingStore(true);
    try {
      const adminUrl = `${currentWebsite.site_url}/wp-admin/admin.php?page=wc-admin&path=%2Fsetup-wizard`;
      const tokenResponse = await generateAdminToken(adminUrl);
      
      if (tokenResponse?.wp_admin_url) {
        window.open(tokenResponse.wp_admin_url, '_blank', 'noopener,noreferrer');
        
        toast({
          title: 'Opening WooCommerce Setup',
          description: 'WooCommerce setup wizard is opening in a new tab',
        });
      } else {
        throw new Error('No admin URL returned');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open WooCommerce setup. Please try again.',
        variant: 'destructive',
        action: (
          <Button variant="outline" size="sm" onClick={handleEnableStore}>
            Retry
          </Button>
        ),
      });
    } finally {
      setIsEnablingStore(false);
    }
  };

  const handleOpenFormsAdmin = async () => {
    if (!currentWebsite?.id) {
      toast({
        title: 'Error',
        description: 'No website selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      const adminUrl = `${currentWebsite.site_url}/wp-admin/admin.php?page=wpcf7`;
      const tokenResponse = await generateAdminToken(adminUrl);
      
      if (tokenResponse?.wp_admin_url) {
        window.open(tokenResponse.wp_admin_url, '_blank', 'noopener,noreferrer');
        
        toast({
          title: 'Opening Forms Admin',
          description: 'WordPress forms admin is opening in a new tab',
        });
      } else {
        throw new Error('No admin URL returned');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open forms admin. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTestZapierWebhook = async () => {
    if (!zapierWebhookUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your Zapier webhook URL',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingWebhook(true);
    try {
      const response = await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          test_event: true,
          website_id: currentWebsite?.id,
          website_url: currentWebsite?.site_url
        }),
      });

      toast({
        title: 'Request Sent',
        description: 'The test request was sent to Zapier. Please check your Zap\'s history to confirm it was triggered.',
      });
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger the Zapier webhook. Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  if (!canUseStore && !canUseForms && !canUseAutomations) {
    return (
      <LockedFeature
        featureName="Store, Forms & Automations"
        description="Enable e-commerce, advanced forms, and marketing automation for your website"
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
          <h2 className="text-2xl font-bold tracking-tight">Store, Forms & Automations</h2>
          <p className="text-muted-foreground">Manage your e-commerce, forms, and marketing automation</p>
        </div>
        <Button onClick={loadStoreSettings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Online Store */}
      {canUseStore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Online Store (WooCommerce)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeSettings?.woocommerce_enabled ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Products</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{storeSettings.products_count}</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Orders</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{storeSettings.orders_count}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      ${storeSettings.revenue_total.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-900">Status</span>
                    </div>
                    <p className="text-sm font-medium text-orange-900">
                      {storeSettings.store_setup_completed ? 'Active' : 'Setup Required'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleEnableStore} disabled={isEnablingStore}>
                    <Settings className="h-4 w-4 mr-2" />
                    {isEnablingStore ? 'Opening...' : 'Manage Store'}
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`${currentWebsite?.site_url}/shop`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Store
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Enable Your Online Store</h3>
                <p className="text-muted-foreground mb-4">
                  Set up WooCommerce to start selling products online
                </p>
                <Button onClick={handleEnableStore} disabled={isEnablingStore}>
                  <Store className="h-4 w-4 mr-2" />
                  {isEnablingStore ? 'Setting Up...' : 'Enable Store'}
                </Button>
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                WooCommerce is the most popular e-commerce platform for WordPress. 
                It includes everything you need to sell products and services online.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Forms & Leads */}
      {canUseForms && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Forms & Lead Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Contact Forms</span>
                </div>
                <p className="text-2xl font-bold text-green-900">3</p>
                <p className="text-sm text-green-700">Active forms</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Total Leads</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">47</p>
                <p className="text-sm text-blue-700">This month</p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Conversion Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">12.3%</p>
                <p className="text-sm text-purple-700">Form submissions</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleOpenFormsAdmin}>
                <FileText className="h-4 w-4 mr-2" />
                Manage Forms
              </Button>
              <Button variant="outline" asChild>
                <a href={`${currentWebsite?.site_url}/contact`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Contact Page
                </a>
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Advanced form features include conditional logic, file uploads, payment integration, 
                and automatic lead nurturing workflows.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Marketing Automations */}
      {canUseAutomations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Marketing Automations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Zapier Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your website to 5,000+ apps with Zapier webhooks
                </p>
                <div className="flex items-center gap-2">
                  <Dialog open={showZapierDialog} onOpenChange={setShowZapierDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Webhook className="h-4 w-4 mr-2" />
                        Configure Zapier
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button variant="outline" asChild>
                    <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Learn More
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Email Marketing</h4>
                <p className="text-sm text-muted-foreground">
                  Automated email sequences for leads and customers
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Automation Recipes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">New Lead Alert</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone submits a contact form
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-sm">Order Confirmation</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send order details to your CRM or spreadsheet
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Welcome Series</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send welcome emails to new subscribers
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">Analytics Sync</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track conversions in Google Analytics
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Marketing automations help you convert more visitors into customers by 
                automatically nurturing leads and following up with personalized messages.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Zapier Configuration Dialog */}
      <Dialog open={showZapierDialog} onOpenChange={setShowZapierDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Zapier Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Step 1:</strong> Create a new Zap in your Zapier account with a "Webhooks by Zapier" trigger.
                <br />
                <strong>Step 2:</strong> Copy the webhook URL and paste it below.
                <br />
                <strong>Step 3:</strong> Test the connection to ensure everything works.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Zapier Webhook URL</Label>
              <Input
                value={zapierWebhookUrl}
                onChange={(e) => setZapierWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
              />
              <p className="text-xs text-muted-foreground">
                This URL will receive data when forms are submitted or orders are placed
              </p>
            </div>

            <div className="space-y-2">
              <Label>Test Data (JSON)</Label>
              <Textarea
                readOnly
                value={JSON.stringify({
                  timestamp: new Date().toISOString(),
                  triggered_from: window.location.origin,
                  test_event: true,
                  website_id: currentWebsite?.id,
                  website_url: currentWebsite?.site_url
                }, null, 2)}
                className="font-mono text-xs"
                rows={6}
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={handleTestZapierWebhook}
                disabled={!zapierWebhookUrl.trim() || isTestingWebhook}
              >
                <Webhook className="h-4 w-4 mr-2" />
                {isTestingWebhook ? 'Testing...' : 'Test Webhook'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowZapierDialog(false)}
              >
                Close
              </Button>
              <Button 
                variant="outline"
                asChild
              >
                <a href="https://zapier.com/apps/webhooks/integrations" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Zapier Help
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}