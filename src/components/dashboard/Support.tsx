import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, BookOpen, Video, Mail, Phone, ExternalLink } from 'lucide-react';

interface SupportProps {
  currentWebsite: any;
}

export function Support({ currentWebsite }: SupportProps) {
  const handleContact = (type: string) => {
    switch (type) {
      case 'email':
        window.open('mailto:support@naveeg.com?subject=Support Request', '_blank');
        break;
      case 'chat':
        // Would integrate with chat system
        break;
      case 'docs':
        window.open('https://docs.naveeg.com', '_blank');
        break;
      case 'tutorials':
        window.open('https://youtube.com/@naveeg', '_blank');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Support Center</h2>
        <p className="text-muted-foreground">Get help when you need it most</p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Live Chat Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get instant help from our support team. Available 9 AM - 6 PM EST, Monday through Friday.
            </p>
            <Button 
              className="w-full" 
              onClick={() => handleContact('chat')}
              disabled
            >
              <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
              Start Live Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send us a detailed message and we'll get back to you within 24 hours.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleContact('email')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Self-Service Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Self-Service Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                   onClick={() => handleContact('docs')}>
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-medium">Documentation</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive guides and tutorials</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                   onClick={() => handleContact('tutorials')}>
                <Video className="h-6 w-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-medium">Video Tutorials</h3>
                  <p className="text-sm text-muted-foreground">Step-by-step video guides</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border opacity-50">
                <MessageCircle className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-medium">Community Forum</h3>
                  <p className="text-sm text-muted-foreground">Connect with other users</p>
                  <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border opacity-50">
                <BookOpen className="h-6 w-6 text-purple-600" />
                <div className="flex-1">
                  <h3 className="font-medium">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">Searchable help articles</p>
                  <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Support */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-2">
              <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">Priority Support</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Upgrade to Pro for phone support, faster response times, and dedicated account management.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
                disabled
              >
                <Badge variant="secondary" className="mr-2">Pro Feature</Badge>
                Upgrade for Priority Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => handleContact('email')}>
          <Mail className="h-6 w-6" />
          <span className="text-xs">Email Us</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => handleContact('docs')}>
          <BookOpen className="h-6 w-6" />
          <span className="text-xs">Docs</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => handleContact('tutorials')}>
          <Video className="h-6 w-6" />
          <span className="text-xs">Videos</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex-col gap-2" disabled>
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs">Chat</span>
        </Button>
      </div>
    </div>
  );
}