import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Terminal, Code, Wrench } from 'lucide-react';

interface DesignStudioProps {
  currentWebsite: any;
}

export function DesignStudio({ currentWebsite }: DesignStudioProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Design Studio</h2>
        <p className="text-muted-foreground">Professional design tools and development access</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Visual Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Edit your website visually with drag-and-drop tools and real-time preview.
            </p>
            <Button className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
              Launch Visual Editor
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              SSH Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Direct server access for advanced customization and development.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
              Generate SSH Key
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              WordPress CLI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage WordPress plugins, themes, and database via command line.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
              Access WP-CLI
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Site Customization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Advanced theme customization and custom CSS/JavaScript injection.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
              Open Customizer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Box */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-primary">Professional Design Tools</h3>
              <p className="text-sm text-muted-foreground mt-1">
                These tools are designed for developers and advanced users. Most website customization 
                can be done through the WordPress admin panel or by contacting our design team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}