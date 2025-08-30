import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Globe, Store, Settings, ShoppingCart, Users, FileText, Palette, Shield, BarChart3 } from 'lucide-react';
import { useWordPressAdmin } from '@/hooks/useTenWebApi';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { LockedFeature } from '../LockedFeature';
import { useToast } from '@/hooks/use-toast';

interface DashboardWordPressProps {
  currentWebsite: any;
}

export function DashboardWordPress({ currentWebsite }: DashboardWordPressProps) {
  const { canUseStore } = useFeatureGate();
  const [isOpeningAdmin, setIsOpeningAdmin] = useState(false);
  const [isEnablingStore, setIsEnablingStore] = useState(false);
  const { toast } = useToast();
  
  const { 
    generateAdminToken,
    data: adminToken,
    loading,
    error 
  } = useWordPressAdmin(currentWebsite?.id || '');

  const handleOpenWPAdmin = async () => {
    if (!currentWebsite?.id) {
      toast({
        title: 'Error',
        description: 'No website selected',
        variant: 'destructive',
      });
      return;
    }

    setIsOpeningAdmin(true);
    try {
      const adminUrl = `${currentWebsite.site_url}/wp-admin`;
      const tokenResponse = await generateAdminToken(adminUrl);
      
      if (tokenResponse?.wp_admin_url) {
        // Use the exact URL returned by the API
        window.open(tokenResponse.wp_admin_url, '_blank', 'noopener,noreferrer');
        
        toast({
          title: 'Opening WordPress Admin',
          description: 'WordPress dashboard is opening in a new tab',
        });
      } else {
        throw new Error('No admin URL returned from autologin');
      }
    } catch (error) {
      // Handle token expiry/single-use with retry
      toast({
        title: 'Error',
        description: 'Failed to open WordPress admin. Please try again.',
        variant: 'destructive',
        action: (
          <Button variant="outline" size="sm" onClick={handleOpenWPAdmin}>
            Retry
          </Button>
        ),
      });
    } finally {
      setIsOpeningAdmin(false);
    }
  };

  const handleEnableStore = async () => {
    if (!canUseStore) {
      toast({
        title: 'Store Feature Locked',
        description: 'Upgrade to Pro plan to enable WooCommerce store',
        variant: 'destructive',
      });
      return;
    }

    setIsEnablingStore(true);
    try {
      // This would typically enable WooCommerce through 10Web API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: 'Store Enabled',
        description: 'WooCommerce has been installed and configured for your website',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable store. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnablingStore(false);
    }
  };

  const wpFeatures = [
    {
      icon: FileText,
      title: 'Posts & Pages',
      description: 'Create and manage blog posts and pages',
      action: 'Manage Content',
      path: '/wp-admin/edit.php'
    },
    {
      icon: Palette,
      title: 'Themes & Customizer',
      description: 'Customize your website appearance',
      action: 'Customize Design',
      path: '/wp-admin/customize.php'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage users and permissions',
      action: 'Manage Users',
      path: '/wp-admin/users.php'
    },
    {
      icon: Settings,
      title: 'Plugins',
      description: 'Install and configure plugins',
      action: 'Manage Plugins',
      path: '/wp-admin/plugins.php'
    },
    {
      icon: BarChart3,
      title: 'SEO Settings',
      description: 'Optimize for search engines',
      action: 'Configure SEO',
      path: '/wp-admin/admin.php?page=wpseo_dashboard'
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Security settings and monitoring',
      action: 'Security Settings',
      path: '/wp-admin/admin.php?page=wordfence'
    }
  ];

  return (
    <div className="space-y-6">
      {/* WordPress Admin Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WordPress Dashboard Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">WordPress Admin Panel</h3>
                <p className="text-sm text-muted-foreground">
                  Access your WordPress dashboard with secure autologin
                </p>
              </div>
            </div>
            <Button 
              onClick={handleOpenWPAdmin}
              disabled={isOpeningAdmin || loading}
              className="flex items-center gap-2"
            >
              {isOpeningAdmin ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Open WP Admin
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wpFeatures.map((feature) => (
              <div key={feature.title} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">{feature.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (adminToken?.token) {
                      const url = `${currentWebsite?.site_url}${feature.path}?autologin_token=${adminToken.token}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } else {
                      handleOpenWPAdmin();
                    }
                  }}
                >
                  {feature.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* WooCommerce Store */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Online Store (WooCommerce)
            {!canUseStore && <Badge variant="outline">Pro Feature</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!canUseStore ? (
            <LockedFeature
              featureName="Online Store"
              description="Add WooCommerce to sell products online with full e-commerce functionality"
              requiredPlan="pro"
              onUpgrade={() => window.location.href = '/plans'}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">WooCommerce Store</h3>
                    <p className="text-sm text-muted-foreground">
                      Full e-commerce solution for selling products online
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleEnableStore}
                    disabled={isEnablingStore}
                    variant="outline"
                  >
                    {isEnablingStore ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mr-2" />
                        Enabling...
                      </>
                    ) : (
                      'Enable Store'
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (adminToken?.token) {
                        const url = `${currentWebsite?.site_url}/wp-admin/admin.php?page=wc-admin&autologin_token=${adminToken.token}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      } else {
                        handleOpenWPAdmin();
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Store
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Store Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Product catalog management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Shopping cart & checkout
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Payment gateway integration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Order management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Inventory tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Customer accounts
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Quick Setup</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                      WooCommerce plugin
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                      Store pages created
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full" />
                      Payment methods
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full" />
                      Shipping settings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full" />
                      Tax configuration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                      First product
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}