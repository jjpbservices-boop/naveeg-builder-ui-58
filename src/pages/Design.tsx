import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Palette, Type, Save, Rocket } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { updateDesign, generateFromSitemap, publishAndFrontpage } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const HEADING_FONTS = [
  'Syne', 'Playfair Display', 'Montserrat', 'Poppins', 'Merriweather', 'DM Sans', 'Karla'
];

const BODY_FONTS = [
  'Inter', 'Roboto', 'Lato', 'Open Sans', 'Source Sans 3', 'Noto Sans'
];

export default function Design() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    colors,
    fonts,
    pages_meta,
    seo_title,
    seo_description,
    seo_keyphrase,
    website_type,
    website_id,
    unique_id,
    business_name,
    business_description,
    business_type,
    updateDesign: updateStoreDesign,
    updateApiData,
    setCurrentStep
  } = useOnboardingStore();

  const handleColorChange = (colorType: keyof typeof colors, value: string) => {
    // Validate HEX format
    const hexPattern = /^#[A-Fa-f0-9]{6}$/;
    if (value && !hexPattern.test(value)) {
      return; // Don't update if invalid HEX
    }
    
    updateStoreDesign({
      colors: {
        ...colors,
        [colorType]: value
      }
    });
  };

  const handleFontChange = (fontType: keyof typeof fonts, value: string) => {
    updateStoreDesign({
      fonts: {
        ...fonts,
        [fontType]: value
      }
    });
  };

  const handleSave = async () => {
    if (!website_id) {
      toast({
        title: 'Error',
        description: 'Missing website ID',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    try {
      await updateDesign(website_id, {
        colors,
        fonts,
        pages_meta,
        seo: {
          title: seo_title,
          description: seo_description,
          keyphrase: seo_keyphrase
        },
        website_type
      });

      toast({
        title: 'Design saved',
        description: 'Your design preferences have been saved.',
      });
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save design. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!website_id || !unique_id) {
      toast({
        title: 'Missing data',
        description: 'Website ID or unique ID is missing',
        variant: 'destructive',
      });
      return;
    }

    if (isLoading) return; // Prevent double-fires
    setIsLoading(true);
    
    try {
      // 1) Kick off server-side generation (server polls 10Web internally)
      try {
        await generateFromSitemap(website_id, unique_id, {
          business_type,
          business_name,
          business_description,
          colors,
          fonts: {
            primary_font: fonts.body
          },
          pages_meta,
          website_title: seo_title,
          website_description: seo_description,
          website_keyphrase: seo_keyphrase,
          website_type
        });
      } catch (e: any) {
        // Treat client timeout or known server states as "generation in progress"
        const okCodes = ['CLIENT_TIMEOUT', 'GENERATE_TIMEOUT', 'GENERATE_FAILED'];
        if (!okCodes.includes(e?.code ?? '')) {
          throw e; // Real error, not timeout
        }
        console.log('Generation in progress, starting polling...', e.code);
      }

      // 2) Poll publish endpoint until pages exist and front page is set
      const deadline = Date.now() + 180000; // 3 minutes
      let pub: any = null;
      
      while (Date.now() < deadline) {
        try {
          pub = await publishAndFrontpage(website_id);
          if (pub?.ok) break; // Success!
        } catch (e: any) {
          if (e?.code !== 'NO_PAGES_YET') {
            throw e; // Real error, not "pages not ready"
          }
        }
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      }
      
      if (!pub?.ok) {
        throw new Error('Generation still in progress. Try again in a moment.');
      }

      // Update store with preview URLs
      updateApiData({
        preview_url: pub.preview_url,
        admin_url: pub.admin_url
      });

      toast({
        title: 'Website generated!',
        description: 'Your website has been created and published.',
      });

      // Navigate to ready page
      setCurrentStep(2);
      navigate({ to: '/ready' });
      
    } catch (error: any) {
      console.error('Error generating website:', error);
      
      // Better error mapping
      const getErrorMessage = (err: any) => {
        switch (err?.code) {
          case 'CLIENT_TIMEOUT': return 'Request timed out. Generation may still be in progress.';
          case 'GENERATE_TIMEOUT': return 'Generation is taking longer than expected. Please try again.';
          case 'NO_PAGES_YET': return 'Website is still being generated. Please wait and try again.';
          case 'GENERATE_FAILED': return 'Generation failed. Please check your input and try again.';
          default: return err?.message || 'Failed to generate website. Please try again.';
        }
      };

      toast({
        title: 'Generation Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidHex = (color: string) => {
    const hexPattern = /^#[A-Fa-f0-9]{6}$/;
    return hexPattern.test(color);
  };

  const canGenerate = isValidHex(colors.primary_color) && 
                     isValidHex(colors.secondary_color) && 
                     isValidHex(colors.background_dark);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Customize your design
            </h1>
            <p className="text-muted-foreground">
              Personalize colors, fonts, and pages to match your brand
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Design Controls */}
            <div className="space-y-6">
              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="text"
                          value={colors.primary_color}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          placeholder="#FF7A00"
                          className="font-mono"
                        />
                        <input
                          type="color"
                          value={colors.primary_color}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          className="w-12 h-10 rounded border border-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="text"
                          value={colors.secondary_color}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          placeholder="#1E62FF"
                          className="font-mono"
                        />
                        <input
                          type="color"
                          value={colors.secondary_color}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          className="w-12 h-10 rounded border border-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="background_dark">Background Dark</Label>
                      <div className="flex gap-2">
                        <Input
                          id="background_dark"
                          type="text"
                          value={colors.background_dark}
                          onChange={(e) => handleColorChange('background_dark', e.target.value)}
                          placeholder="#121212"
                          className="font-mono"
                        />
                        <input
                          type="color"
                          value={colors.background_dark}
                          onChange={(e) => handleColorChange('background_dark', e.target.value)}
                          className="w-12 h-10 rounded border border-input"
                        />
                      </div>
                    </div>
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
                    <Label htmlFor="heading_font">Heading Font</Label>
                    <Select value={fonts.heading} onValueChange={(value: any) => handleFontChange('heading', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HEADING_FONTS.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="body_font">Body Font</Label>
                    <Select value={fonts.body} onValueChange={(value: any) => handleFontChange('body', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_FONTS.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !canGenerate}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Website...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-5 w-5" />
                      Generate Website
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* SEO Info */}
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">SEO</h3>
                      <div className="space-y-1">
                        <p className="font-medium">{seo_title}</p>
                        <p className="text-sm text-muted-foreground">{seo_description}</p>
                        <p className="text-xs text-muted-foreground">Keywords: {seo_keyphrase}</p>
                      </div>
                    </div>

                    {/* Pages Canvas */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Pages ({pages_meta.length}/6)
                      </h3>
                      <div className="space-y-2">
                        {pages_meta.map((page, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <h4 className="font-medium">{page.title}</h4>
                            {page.sections && page.sections.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {page.sections.map((section, sectionIndex) => (
                                  <span
                                    key={sectionIndex}
                                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                                  >
                                    {section.section_title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Color Preview */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Color Preview
                      </h3>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: colors.primary_color }}
                          title={`Primary: ${colors.primary_color}`}
                        />
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: colors.secondary_color }}
                          title={`Secondary: ${colors.secondary_color}`}
                        />
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: colors.background_dark }}
                          title={`Background: ${colors.background_dark}`}
                        />
                      </div>
                    </div>

                    {/* Font Preview */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        Font Preview
                      </h3>
                      <div className="space-y-2">
                        <div style={{ fontFamily: fonts.heading }} className="text-lg font-semibold">
                          {fonts.heading} - Heading
                        </div>
                        <div style={{ fontFamily: fonts.body }} className="text-base">
                          {fonts.body} - Body text
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}