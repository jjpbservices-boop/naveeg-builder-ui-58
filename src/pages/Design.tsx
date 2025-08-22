import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingStore } from '@/lib/stores/useOnboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';

const Design: React.FC = () => {
  const { t } = useTranslation(['design', 'common']);
  const navigate = useNavigate();

  const {
    business_name,
    colors,
    fonts,
    pages_meta,
    website_type,
    updateDesign,
    addPage,
    removePage,
    updatePage,
    updateWebsiteType,
  } = useOnboardingStore();

  const handleColorChange = (colorType: 'primary' | 'secondary', value: string) => {
    updateDesign({
      colors: {
        ...colors,
        [colorType]: value,
      },
    });
  };

  const handleBackgroundToggle = (checked: boolean) => {
    updateDesign({
      colors: {
        ...colors,
        background_dark: checked,
      },
    });
  };

  const handleFontChange = (fontType: 'heading' | 'body', value: string) => {
    updateDesign({
      fonts: {
        ...fonts,
        [fontType]: value as any,
      },
    });
  };

  const handleAddPage = () => {
    if (pages_meta.length >= 6) return;
    
    const newPage = {
      id: Date.now().toString(),
      title: 'New Page',
      type: 'custom' as const,
      description: 'Custom page description',
      isRequired: false,
    };
    
    addPage(newPage);
  };

  const handlePageTitleChange = (pageId: string, title: string) => {
    updatePage(pageId, { title });
  };

  const handleSubmit = () => {
    navigate({ to: '/generate' });
  };

  const handleBack = () => {
    navigate({ to: '/onboarding/brief' });
  };

  const fontOptions = [
    { value: 'syne', label: t('design:fonts.syne'), class: 'font-syne' },
    { value: 'playfair', label: t('design:fonts.playfair'), class: 'font-serif' },
    { value: 'montserrat', label: t('design:fonts.montserrat'), class: 'font-sans' },
  ];

  const bodyFontOptions = [
    { value: 'inter', label: t('design:fonts.inter'), class: 'font-sans' },
    { value: 'lato', label: t('design:fonts.lato'), class: 'font-sans' },
    { value: 'roboto', label: t('design:fonts.roboto'), class: 'font-sans' },
  ];

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
                Design
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="font-syne text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('design:title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('design:subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design Controls */}
          <div className="space-y-6 animate-slide-up">
            {/* Website Type */}
            <div className="bg-card rounded-3xl border shadow-soft p-6">
              <h3 className="text-xl font-semibold mb-4">Website Type</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={website_type === 'basic' ? 'default' : 'outline'}
                  onClick={() => updateWebsiteType('basic')}
                  className="h-16 flex-col rounded-2xl"
                >
                  <span className="font-semibold">Basic</span>
                  <span className="text-xs opacity-70">Standard website</span>
                </Button>
                <Button
                  variant={website_type === 'ecommerce' ? 'default' : 'outline'}
                  onClick={() => updateWebsiteType('ecommerce')}
                  className="h-16 flex-col rounded-2xl"
                >
                  <span className="font-semibold">E-commerce</span>
                  <span className="text-xs opacity-70">Online store</span>
                </Button>
              </div>
            </div>

            {/* Colors Section */}
            <div className="bg-card rounded-3xl border shadow-soft p-6">
              <h3 className="text-xl font-semibold mb-6">Colors</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t('design:colors.primary')}
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1 h-12 rounded-2xl border-2"
                      placeholder="#FF7A00"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t('design:colors.secondary')}
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1 h-12 rounded-2xl border-2"
                      placeholder="#6B7280"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                <div>
                  <Label className="text-sm font-medium">
                    {t('design:colors.darkBackground')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Use a dark background theme
                  </p>
                </div>
                <Switch
                  checked={colors.background_dark}
                  onCheckedChange={handleBackgroundToggle}
                />
              </div>
            </div>

            {/* Fonts Section */}
            <div className="bg-card rounded-3xl border shadow-soft p-6">
              <h3 className="text-xl font-semibold mb-6">Typography</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t('design:fonts.heading')}
                  </Label>
                  <Select value={fonts.heading} onValueChange={(value) => handleFontChange('heading', value)}>
                    <SelectTrigger className="h-12 rounded-2xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span className={font.class}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t('design:fonts.body')}
                  </Label>
                  <Select value={fonts.body} onValueChange={(value) => handleFontChange('body', value)}>
                    <SelectTrigger className="h-12 rounded-2xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyFontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span className={font.class}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Page Management Section */}
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

          {/* Live Preview */}
          <div className="animate-slide-up">
            <div className="bg-card rounded-3xl border shadow-soft p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-6">{t('design:preview.title')}</h3>
              
              {/* Preview Area */}
              <div 
                className={`rounded-2xl border-2 p-6 transition-colors ${
                  colors.background_dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
                }`}
                style={{
                  '--primary-color': colors.primary,
                  '--secondary-color': colors.secondary,
                } as React.CSSProperties}
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className={`text-2xl font-bold ${colors.background_dark ? 'text-white' : 'text-gray-900'}`}
                    style={{ 
                      fontFamily: fonts.heading === 'syne' ? 'Syne' : fonts.heading === 'playfair' ? 'serif' : 'sans-serif',
                      color: colors.primary
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
                    className={`text-xl font-semibold ${colors.background_dark ? 'text-white' : 'text-gray-900'}`}
                    style={{ 
                      fontFamily: fonts.heading === 'syne' ? 'Syne' : fonts.heading === 'playfair' ? 'serif' : 'sans-serif' 
                    }}
                  >
                    {t('design:preview.sampleHeading')}
                  </h3>
                  
                  <p 
                    className={`text-sm ${colors.background_dark ? 'text-gray-300' : 'text-gray-600'}`}
                    style={{ 
                      fontFamily: fonts.body === 'inter' ? 'Inter' : fonts.body 
                    }}
                  >
                    {t('design:preview.sampleText')}
                  </p>
                  
                  <Button
                    className="rounded-xl"
                    style={{ 
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                      color: 'white'
                    }}
                  >
                    {t('design:preview.sampleButton')}
                  </Button>
                </div>
              </div>

              {/* Sitemap Preview */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">{t('design:sitemap.title')}</h4>
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