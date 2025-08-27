import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Palette, Type, Save, Rocket } from 'lucide-react';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { updateDesign } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { HeroAnimation } from '@/components/HeroAnimation';
import { GoogleFontSelector } from '@/components/GoogleFonts';

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

  const handleFontChange = (value: string) => {
    updateStoreDesign({
      fonts: {
        // Use the same font for both heading and body since we only send one primary font
        heading: value as any,
        body: value as any
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
    
    // Save current design before generating
    await handleSave();
    
    // Navigate to generating page
    navigate({ to: '/generating' });
  };

  const isValidHex = (color: string) => {
    const hexPattern = /^#[A-Fa-f0-9]{6}$/;
    return hexPattern.test(color);
  };

  const canGenerate = isValidHex(colors.primary_color) && 
                     isValidHex(colors.secondary_color) && 
                     isValidHex(colors.background_dark);

  return (
    <div className="bg-gradient-to-br from-background via-muted/30 to-background">
      <HeroAnimation />
      
      <div className="relative z-10 flex-1 py-8 sm:py-12 px-3 sm:px-4">
        <div className="container mx-auto max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Customize your design
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Personalize colors and fonts to match your brand
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Design Controls */}
            <div className="space-y-4 sm:space-y-6">
              {/* Colors */}
              <Card className="bg-card/90 backdrop-blur-sm border shadow-soft rounded-2xl sm:rounded-3xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                    Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color" className="text-sm sm:text-base">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="text"
                          value={colors.primary_color}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          placeholder="#FF7A00"
                          className="font-mono text-xs sm:text-sm h-9 sm:h-10 rounded-xl"
                        />
                        <input
                          type="color"
                          value={colors.primary_color}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          className="w-9 h-9 sm:w-12 sm:h-10 rounded border border-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color" className="text-sm sm:text-base">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="text"
                          value={colors.secondary_color}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          placeholder="#1E62FF"
                          className="font-mono text-xs sm:text-sm h-9 sm:h-10 rounded-xl"
                        />
                        <input
                          type="color"
                          value={colors.secondary_color}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          className="w-9 h-9 sm:w-12 sm:h-10 rounded border border-input"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="background_dark" className="text-sm sm:text-base">Background Dark</Label>
                      <div className="flex gap-2">
                        <Input
                          id="background_dark"
                          type="text"
                          value={colors.background_dark}
                          onChange={(e) => handleColorChange('background_dark', e.target.value)}
                          placeholder="#121212"
                          className="font-mono text-xs sm:text-sm h-9 sm:h-10 rounded-xl"
                        />
                        <input
                          type="color"
                          value={colors.background_dark}
                          onChange={(e) => handleColorChange('background_dark', e.target.value)}
                          className="w-9 h-9 sm:w-12 sm:h-10 rounded border border-input"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card className="bg-card/90 backdrop-blur-sm border shadow-soft rounded-2xl sm:rounded-3xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Type className="h-4 w-4 sm:h-5 sm:w-5" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <GoogleFontSelector
                    selectedFont={fonts.heading}
                    onFontChange={handleFontChange}
                    label="Primary Font"
                    placeholder="Search from 100+ Google Fonts..."
                  />
                  <p className="text-xs text-muted-foreground">
                    This font will be used throughout your website for both headings and body text.
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="outline"
                  className="w-full h-10 sm:h-12 text-sm sm:text-base rounded-xl"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                      Save
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !canGenerate}
                  className="w-full text-sm sm:text-lg py-4 sm:py-6 h-12 sm:h-auto rounded-xl"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                      Generating Website...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                      Generate Website
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card className="bg-card/90 backdrop-blur-sm border shadow-soft">
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
                      <div style={{ fontFamily: fonts.heading }} className="text-lg font-semibold">
                        {fonts.heading} - Your website will use this font
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