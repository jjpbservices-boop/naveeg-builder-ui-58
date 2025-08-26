import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Layout,
  Eye,
  Sparkles,
  Brush,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DashboardDesignProps {
  currentWebsite: any;
  onWebsiteUpdate: () => void;
}

const BUTTON_STYLES = [
  { id: 'rounded', name: 'Rounded', preview: 'Rounded corners', className: 'rounded-lg' },
  { id: 'squared', name: 'Squared', preview: 'Sharp corners', className: 'rounded-none' },
  { id: 'pill', name: 'Pill', preview: 'Fully rounded', className: 'rounded-full' },
  { id: 'border-only', name: 'Border Only', preview: 'Outline style', className: 'border-2 bg-transparent' }
];

const HEADING_FONTS = [
  { value: 'Syne', label: 'Syne', preview: 'Modern & Bold' },
  { value: 'Playfair Display', label: 'Playfair Display', preview: 'Elegant & Classic' },
  { value: 'Montserrat', label: 'Montserrat', preview: 'Clean & Professional' },
  { value: 'Poppins', label: 'Poppins', preview: 'Friendly & Round' },
  { value: 'Merriweather', label: 'Merriweather', preview: 'Traditional & Readable' }
];

const BODY_FONTS = [
  { value: 'Inter', label: 'Inter', preview: 'Modern & Versatile' },
  { value: 'Roboto', label: 'Roboto', preview: 'Google Standard' },
  { value: 'Lato', label: 'Lato', preview: 'Humanist & Warm' },
  { value: 'Open Sans', label: 'Open Sans', preview: 'Neutral & Clear' },
  { value: 'Source Sans 3', label: 'Source Sans 3', preview: 'Adobe Standard' }
];

const COLOR_PRESETS = [
  { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#0F172A', accent: '#F0F9FF' },
  { name: 'Forest Green', primary: '#10B981', secondary: '#065F46', accent: '#ECFDF5' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#9A3412', accent: '#FFF7ED' },
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#581C87', accent: '#F3E8FF' },
  { name: 'Crimson Red', primary: '#EF4444', secondary: '#7F1D1D', accent: '#FEF2F2' },
  { name: 'Golden Yellow', primary: '#F59E0B', secondary: '#78350F', accent: '#FFFBEB' }
];

export function DashboardDesign({ currentWebsite, onWebsiteUpdate }: DashboardDesignProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Design state
  const [buttonStyle, setButtonStyle] = useState(currentWebsite?.button_style || 'rounded');
  const [primaryColor, setPrimaryColor] = useState(currentWebsite?.colors?.primary_color || '#FF4A1C');
  const [secondaryColor, setSecondaryColor] = useState(currentWebsite?.colors?.secondary_color || '#1E293B');
  const [accentColor, setAccentColor] = useState(currentWebsite?.colors?.accent_color || '#F8FAFC');
  const [headingFont, setHeadingFont] = useState(currentWebsite?.fonts?.heading || 'Syne');
  const [bodyFont, setBodyFont] = useState(currentWebsite?.fonts?.body || 'Inter');

  const handleChange = (setter: any) => (value: any) => {
    setter(value);
    setHasChanges(true);
  };

  const applyColorPreset = (preset: any) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (currentWebsite) {
      setButtonStyle(currentWebsite.button_style || 'rounded');
      setPrimaryColor(currentWebsite.colors?.primary_color || '#FF4A1C');
      setSecondaryColor(currentWebsite.colors?.secondary_color || '#1E293B');
      setAccentColor(currentWebsite.colors?.accent_color || '#F8FAFC');
      setHeadingFont(currentWebsite.fonts?.heading || 'Syne');
      setBodyFont(currentWebsite.fonts?.body || 'Inter');
      setHasChanges(false);
    }
  };

  const saveDesignChanges = async () => {
    if (!currentWebsite || !hasChanges) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          button_style: buttonStyle,
          colors: {
            ...currentWebsite.colors,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            accent_color: accentColor
          },
          fonts: {
            ...currentWebsite.fonts,
            heading: headingFont,
            body: bodyFont
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', currentWebsite.id);

      if (error) throw error;

      setHasChanges(false);
      toast({
        title: 'Design Updated',
        description: 'Your website design has been updated successfully.',
      });
      
      onWebsiteUpdate();
    } catch (error) {
      console.error('Error updating design:', error);
      toast({
        title: 'Error',
        description: 'Failed to update design. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Design Customization</h2>
          <p className="text-sm text-muted-foreground">
            Customize your website's appearance with live preview
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={resetToDefaults} disabled={isLoading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={saveDesignChanges} disabled={!hasChanges || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Color Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Color Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {COLOR_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={() => applyColorPreset(preset)}
              >
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => handleChange(setPrimaryColor)(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => handleChange(setPrimaryColor)(e.target.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => handleChange(setSecondaryColor)(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => handleChange(setSecondaryColor)(e.target.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={accentColor}
                  onChange={(e) => handleChange(setAccentColor)(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => handleChange(setAccentColor)(e.target.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Button Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {BUTTON_STYLES.map((style) => (
                <Button
                  key={style.id}
                  variant={buttonStyle === style.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => handleChange(setButtonStyle)(style.id)}
                >
                  <div 
                    className={`w-8 h-4 bg-primary ${style.className}`}
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="text-center">
                    <span className="font-medium text-sm">{style.name}</span>
                    <p className="text-xs text-muted-foreground">{style.preview}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select value={headingFont} onValueChange={handleChange(setHeadingFont)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <div>
                        <div className="font-medium">{font.label}</div>
                        <div className="text-xs text-muted-foreground">{font.preview}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select value={bodyFont} onValueChange={handleChange(setBodyFont)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <div>
                        <div className="font-medium">{font.label}</div>
                        <div className="text-xs text-muted-foreground">{font.preview}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 border rounded-lg" style={{ backgroundColor: accentColor }}>
              <h3 
                className="text-xl font-bold mb-2"
                style={{ 
                  fontFamily: headingFont,
                  color: secondaryColor
                }}
              >
                Welcome to Your Business
              </h3>
              <p 
                className="text-sm mb-4 opacity-80"
                style={{ 
                  fontFamily: bodyFont,
                  color: secondaryColor
                }}
              >
                This is how your content will appear with the selected fonts and colors.
              </p>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 text-white text-sm font-medium ${BUTTON_STYLES.find(s => s.id === buttonStyle)?.className}`}
                  style={{ backgroundColor: primaryColor }}
                >
                  Primary Button
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium border-2 ${BUTTON_STYLES.find(s => s.id === buttonStyle)?.className}`}
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor,
                    backgroundColor: 'transparent'
                  }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <div className="p-4 bg-accent rounded-lg border">
          <div className="flex items-center gap-2">
            <Brush className="h-5 w-5 text-primary" />
            <span className="font-medium">You have unsaved changes</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Save your changes to apply them to your live website.
          </p>
        </div>
      )}
    </div>
  );
}