import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const Design: React.FC = () => {
  const { t } = useTranslation(['design', 'common']);
  const navigate = useNavigate();

  const {
    business_name,
    colors,
    fonts,
    pages_meta,
    website_type,
    seo_title,
    seo_description,
    seo_keyphrase,
    updateDesign,
    addPage,
    removePage,
    updatePage,
    updateWebsiteType,
    updateSEO,
  } = useOnboardingStore();

  const [localColors, setLocalColors] = useState(colors);
  const [localFonts, setLocalFonts] = useState(fonts);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation function for HEX colors
  const isValidHex = (value: string): boolean => {
    return /^#([A-Fa-f0-9]{6})$/.test(value);
  };

  const validateAndSetColor = (colorType: keyof typeof colors, value: string) => {
    const newColors = { ...localColors, [colorType]: value };
    setLocalColors(newColors);

    if (isValidHex(value)) {
      updateDesign({ colors: newColors });
      setValidationErrors(prev => ({ ...prev, [colorType]: '' }));
    } else {
      setValidationErrors(prev => ({ ...prev, [colorType]: 'Enter HEX like #A1B2C3' }));
    }
  };

  const handleFontChange = (fontType: 'heading' | 'body', value: string) => {
    const newFonts = { ...localFonts, [fontType]: value as any };
    setLocalFonts(newFonts);
    updateDesign({ fonts: newFonts });
  };

  const handleAddPage = () => {
    if (pages_meta.length >= 6) return;
    
    const newPage = {
      id: Date.now().toString(),
      title: 'New Page',
      type: 'custom' as const,
      description: 'Custom page description',
      isRequired: false,
      sections: [],
    };
    
    addPage(newPage);
  };

  const handlePageTitleChange = (pageId: string, title: string) => {
    updatePage(pageId, { title });
  };

  const handleSubmit = () => {
    // Validate all colors before proceeding
    const hasValidationErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasValidationErrors) {
      toast.error('Please fix color validation errors before continuing');
      return;
    }

    // Ensure all colors are valid HEX
    if (!isValidHex(localColors.primary_color) || 
        !isValidHex(localColors.secondary_color) || 
        !isValidHex(localColors.background_dark)) {
      toast.error('Please enter valid HEX colors for all fields');
      return;
    }

    navigate({ to: '/generate' });
  };

  const handleBack = () => {
    navigate({ to: '/onboarding/brief' });
  };

  const headingFontOptions = [
    { value: 'Syne', label: 'Syne' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'DM Sans', label: 'DM Sans' },
    { value: 'Karla', label: 'Karla' },
  ];

  const bodyFontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Source Sans 3', label: 'Source Sans 3' },
    { value: 'Noto Sans', label: 'Noto Sans' },
  ];

  // Load Google Fonts dynamically
  useEffect(() => {
    const loadFont = (fontName: string) => {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
      
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    };

    // Load selected fonts
    loadFont(localFonts.heading);
    loadFont(localFonts.body);
  }, [localFonts]);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Wizard Progress */}
        <div className="flex items-center justify-center mb-8 animate-slide-up">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary">
                Site Brief
              </span>
            </div>
            <div className="w-8 h-px bg-primary"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-primary">
                Design & Review
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            Design & Review
          </h1>
          <p className="text-lg text-muted-foreground">
            Customize colors, fonts, and review your website structure.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design Controls */}
          <div className="space-y-6 animate-slide-up">
            {/* Colors Section */}
            <div className="bg-card rounded-3xl border shadow-soft p-6">
              <h3 className="text-xl font-semibold mb-6">Colors</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Primary Color
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={localColors.primary_color}
                      onChange={(e) => validateAndSetColor('primary_color', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={localColors.primary_color}
                        onChange={(e) => validateAndSetColor('primary_color', e.target.value)}
                        className="h-12 rounded-2xl border-2"
                        placeholder="#FF4A1C"
                      />
                      {validationErrors.primary_color && (
                        <p className="text-xs text-destructive mt-1">{validationErrors.primary_color}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Secondary Color
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={localColors.secondary_color}
                      onChange={(e) => validateAndSetColor('secondary_color', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={localColors.secondary_color}
                        onChange={(e) => validateAndSetColor('secondary_color', e.target.value)}
                        className="h-12 rounded-2xl border-2"
                        placeholder="#6B7280"
                      />
                      {validationErrors.secondary_color && (
                        <p className="text-xs text-destructive mt-1">{validationErrors.secondary_color}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Background Dark
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={localColors.background_dark}
                      onChange={(e) => validateAndSetColor('background_dark', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={localColors.background_dark}
                        onChange={(e) => validateAndSetColor('background_dark', e.target.value)}
                        className="h-12 rounded-2xl border-2"
                        placeholder="#000000"
                      />
                      {validationErrors.background_dark && (
                        <p className="text-xs text-destructive mt-1">{validationErrors.background_dark}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fonts Section */}
            <div className="bg-card rounded-3xl border shadow-soft p-6">
              <h3 className="text-xl font-semibold mb-6">Typography</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Heading Font
                  </Label>
                  <Select value={localFonts.heading} onValueChange={(value) => handleFontChange('heading', value)}>
                    <SelectTrigger className="h-12 rounded-2xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      {headingFontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Body Font
                  </Label>
                  <Select value={localFonts.body} onValueChange={(value) => handleFontChange('body', value)}>
                    <SelectTrigger className="h-12 rounded-2xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      {bodyFontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Canvas - Page Management */}
            <div className="bg-card rounded-3xl border shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Website Pages</h3>
                <span className="text-sm text-muted-foreground">
                  Add Page ({pages_meta.length}/6)
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                {pages_meta.map((page) => (
                  <div key={page.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Input
                      value={page.title}
                      onChange={(e) => handlePageTitleChange(page.id, e.target.value)}
                      className="flex-1 h-10 rounded-lg border"
                      disabled={page.isRequired}
                    />
                    <span className="text-xs text-muted-foreground min-w-[60px]">
                      {page.type}
                    </span>
                    {!page.isRequired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePage(page.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {pages_meta.length < 6 && (
                <Button
                  variant="outline"
                  onClick={handleAddPage}
                  className="w-full h-12 rounded-xl border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page
                </Button>
              )}
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="animate-slide-up">
            <div className="bg-card rounded-3xl border shadow-soft p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-6">Live Preview</h3>
              
              {/* Preview Area */}
              <div 
                className="rounded-2xl border-2 p-6 transition-colors bg-white border-gray-200"
                style={{
                  backgroundColor: localColors.background_dark,
                  borderColor: localColors.secondary_color,
                }}
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ 
                      fontFamily: localFonts.heading,
                      color: localColors.primary_color
                    }}
                  >
                    {business_name || 'Your Business'}
                  </h2>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="space-y-4">
                  <h3 
                    className="text-xl font-semibold text-white"
                    style={{ 
                      fontFamily: localFonts.heading 
                    }}
                  >
                    Welcome to Your Business
                  </h3>
                  
                  <p 
                    className="text-sm text-gray-300"
                    style={{ 
                      fontFamily: localFonts.body 
                    }}
                  >
                    This is how your content will appear on your website. The colors and fonts you choose will be applied throughout your entire site.
                  </p>
                  
                  <Button
                    className="rounded-xl text-white"
                    style={{ 
                      backgroundColor: localColors.primary_color,
                      borderColor: localColors.primary_color,
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>

              {/* Sitemap Preview */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">Your Website Structure</h4>
                <div className="grid grid-cols-2 gap-2">
                  {pages_meta.slice(0, 4).map((page) => (
                    <div key={page.id} className="p-2 bg-muted rounded-lg text-center">
                      <div className="text-xs font-medium">{page.title}</div>
                      <div className="text-xs text-muted-foreground">{page.type}</div>
                    </div>
                  ))}
                </div>
                {pages_meta.length > 4 && (
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    +{pages_meta.length - 4} more pages
                  </div>
                )}
              </div>

              {/* Website Type Badge */}
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {website_type === 'basic' ? 'Standard Website' : 'E-commerce Store'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            className="touch-target rounded-2xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common:global.back')}
          </Button>
          
          <Button
            onClick={handleSubmit}
            className="flex-1 touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
          >
            Generate Website
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Design;