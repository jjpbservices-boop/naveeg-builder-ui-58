import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  Archive, 
  HardDrive, 
  Globe, 
  Shield, 
  Lock,
  Database,
  Server,
  Settings
} from 'lucide-react';

interface AdvancedProps {
  currentWebsite: any;
}

export function Advanced({ currentWebsite }: AdvancedProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Advanced Settings</h2>
        <p className="text-muted-foreground">Professional tools and configuration options</p>
      </div>

      {/* Backup & Recovery */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Backup & Recovery
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Automated Backups</h4>
                  <p className="text-sm text-muted-foreground">Daily backups are running automatically</p>
                  <Button variant="outline" size="sm" disabled>
                    <Badge variant="secondary" className="mr-2">Active</Badge>
                    Configure Schedule
                  </Button>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Manual Backup</h4>
                  <p className="text-sm text-muted-foreground">Create an instant backup</p>
                  <Button variant="outline" size="sm" disabled>
                    <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                    Create Backup Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Storage Management */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage Management
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Database</p>
                  <p className="text-2xl font-bold">45 MB</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Files</p>
                  <p className="text-2xl font-bold">2.1 GB</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Server className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Total Used</p>
                  <p className="text-2xl font-bold">2.15 GB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                  Optimize Database
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                  Clean Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Domain & SSL */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Domain & SSL Management
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{currentWebsite?.subdomain || 'your-site'}.naveeg.app</p>
                    <p className="text-sm text-muted-foreground">Primary domain</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <p className="font-medium">Custom Domain</p>
                    <p className="text-sm text-muted-foreground">Connect your own domain</p>
                  </div>
                  <Badge variant="outline">Pro Feature</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                  Add Custom Domain
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Active</Badge>
                  SSL Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Security Settings */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Protection
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">SSL Certificate</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Basic Firewall</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Advanced Firewall</span>
                    <Badge variant="outline">Pro Feature</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">2FA Protection</span>
                    <Badge variant="outline">Pro Feature</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                  Configure Firewall
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                  Security Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* System Settings */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>PHP Version</span>
                  <Badge variant="secondary">8.1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>WordPress Version</span>
                  <Badge variant="secondary">6.4.2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Status</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                  Update Settings
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}