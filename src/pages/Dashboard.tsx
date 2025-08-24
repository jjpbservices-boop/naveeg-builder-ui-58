import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  ExternalLink, 
  Settings, 
  BarChart3, 
  Palette, 
  Type, 
  Monitor, 
  Smartphone,
  User,
  LogOut,
  Shield,
  Copy,
  Check,
  Edit3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const BUTTON_STYLES = [
  { id: 'rounded', name: 'Rounded', preview: 'border-radius: 0.5rem' },
  { id: 'squared', name: 'Squared', preview: 'border-radius: 0' },
  { id: 'pill', name: 'Pill', preview: 'border-radius: 9999px' },
  { id: 'border-only', name: 'Border Only', preview: 'background: transparent; border: 2px solid' }
];

const HEADING_FONTS = ['Syne', 'Playfair Display', 'Montserrat', 'Poppins', 'Merriweather'];
const BODY_FONTS = ['Inter', 'Roboto', 'Lato', 'Open Sans', 'Source Sans 3'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [websites, setWebsites] = useState<any[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'design' | 'analytics' | 'domain'>('overview');

  // Quick design changes state
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [primaryColor, setPrimaryColor] = useState('#FF7A00');
  const [secondaryColor, setSecondaryColor] = useState('#1E62FF');
  const [headingFont, setHeadingFont] = useState('Syne');
  const [bodyFont, setBodyFont] = useState('Inter');

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: '/auth' });
        return;
      }
      setUser(session.user);
      loadUserWebsites(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate({ to: '/auth' });
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserWebsites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWebsites(data || []);
      if (data && data.length > 0) {
        setCurrentWebsite(data[0]);
        // Load current design settings
        if (data[0].colors && typeof data[0].colors === 'object') {
          setPrimaryColor((data[0].colors as any).primary_color || '#FF7A00');
          setSecondaryColor((data[0].colors as any).secondary_color || '#1E62FF');
        }
        if (data[0].fonts && typeof data[0].fonts === 'object') {
          setHeadingFont((data[0].fonts as any).heading || 'Syne');
          setBodyFont((data[0].fonts as any).body || 'Inter');
        }
      }
    } catch (error) {
      console.error('Error loading websites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your websites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickDesignUpdate = async () => {
    if (!currentWebsite) return;

    try {
      const { error } = await supabase
        .from('sites')
        .update({
          colors: {
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            background_dark: (currentWebsite.colors as any)?.background_dark || '#121212'
          },
          fonts: {
            heading: headingFont,
            body: bodyFont
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', currentWebsite.id);

      if (error) throw error;

      toast({
        title: 'Design updated',
        description: 'Your website design has been updated successfully.',
      });

      // Reload current website data
      loadUserWebsites(user.id);
    } catch (error) {
      console.error('Error updating design:', error);
      toast({
        title: 'Error',
        description: 'Failed to update design',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Website Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Your Live Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentWebsite?.site_url ? (
            <>
              <div className="flex items-center gap-2">
                <Input 
                  value={currentWebsite.site_url} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCopyUrl(currentWebsite.site_url)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href={currentWebsite.site_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview Site
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={currentWebsite.admin_url} target="_blank" rel="noopener noreferrer">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No website found</p>
              <Button onClick={() => navigate({ to: '/brief' })} className="mt-4">
                Create Your First Website
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Website Details */}
      <Card>
        <CardHeader>
          <CardTitle>Website Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentWebsite ? (
            <>
              <div>
                <Label className="text-sm font-medium">Business Name</Label>
                <p className="text-sm text-muted-foreground">{currentWebsite.business_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Business Type</Label>
                <Badge variant="secondary">{currentWebsite.business_type}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={currentWebsite.status === 'published' ? 'default' : 'secondary'}>
                  {currentWebsite.status || 'Active'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentWebsite.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentWebsite.updated_at).toLocaleDateString()}
                </p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No website selected</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderQuickDesign = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Button Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Button Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {BUTTON_STYLES.map((style) => (
                <Button
                  key={style.id}
                  variant={buttonStyle === style.id ? "default" : "outline"}
                  className="h-16 flex flex-col"
                  onClick={() => setButtonStyle(style.id)}
                >
                  <span className="font-medium">{style.name}</span>
                  <span className="text-xs opacity-70">{style.preview}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fonts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Heading Font</Label>
            <Select value={headingFont} onValueChange={setHeadingFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEADING_FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Body Font</Label>
            <Select value={bodyFont} onValueChange={setBodyFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BODY_FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleQuickDesignUpdate}>
          Apply Changes
        </Button>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">1,234</div>
            <div className="text-sm text-muted-foreground">Page Views</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">567</div>
            <div className="text-sm text-muted-foreground">Unique Visitors</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">89%</div>
            <div className="text-sm text-muted-foreground">Bounce Rate</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Analytics integration coming soon. Connect Google Analytics for detailed insights.
        </p>
      </CardContent>
    </Card>
  );

  const renderDomain = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Domain Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Current Domain</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input 
              value={currentWebsite?.site_url || 'No domain'} 
              readOnly 
              className="flex-1"
            />
            <Button size="sm" variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <Label className="text-sm font-medium">Connect Custom Domain</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Connect your own domain to your website
          </p>
          <div className="flex gap-2">
            <Input placeholder="yourdomain.com" className="flex-1" />
            <Button>Connect</Button>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">SSL Certificate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your website is secured with a free SSL certificate
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                {currentWebsite ? currentWebsite.business_name : 'Manage your websites'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeView === 'overview' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('overview')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeView === 'design' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('design')}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Quick Design
                </Button>
                <Button
                  variant={activeView === 'analytics' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  variant={activeView === 'domain' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('domain')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Domain
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'design' && renderQuickDesign()}
            {activeView === 'analytics' && renderAnalytics()}
            {activeView === 'domain' && renderDomain()}
          </div>
        </div>
      </div>
    </div>
  );
}