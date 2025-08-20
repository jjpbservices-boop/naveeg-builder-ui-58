import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Check, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Design: React.FC = () => {
  const { t } = useTranslation(['design', 'common']);
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [design, setDesign] = useState(state.design);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_DESIGN',
      payload: design,
    });
    navigate({ to: '/generate' });
  };

  const handleBack = () => {
    navigate({ to: '/brief' });
  };

  const updateDesign = (updates: Partial<typeof design>) => {
    setDesign(prev => ({ ...prev, ...updates }));
  };

  const fontOptions = [
    { value: 'syne', label: t('design:fonts.syne') },
    { value: 'playfair', label: t('design:fonts.playfair') },
    { value: 'montserrat', label: t('design:fonts.montserrat') },
  ];

  const bodyFontOptions = [
    { value: 'inter', label: t('design:fonts.inter') },
    { value: 'lato', label: t('design:fonts.lato') },
    { value: 'roboto', label: t('design:fonts.roboto') },
  ];

  const sitemapPages = [
    { key: 'home', label: t('design:sitemap.home') },
    { key: 'about', label: t('design:sitemap.about') },
    { key: 'services', label: t('design:sitemap.services') },
    { key: 'gallery', label: t('design:sitemap.gallery') },
    { key: 'contact', label: t('design:sitemap.contact') },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Wizard Progress */}
        <div className="flex items-center justify-center mb-8 animate-slide-up">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-success">
                {t('common:global.completed', { ns: 'common' })}
              </span>
            </div>
            <div className="w-8 h-px bg-primary"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Check className="h-4 w-4" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design Controls */}
          <div className="bg-card rounded-3xl border shadow-soft p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Colors */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Colors
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm font-medium">
                      {t('design:colors.primary')}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-border"
                        style={{ backgroundColor: design.primaryColor }}
                      />
                      <Input
                        id="primaryColor"
                        type="text"
                        value={design.primaryColor}
                        onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                        placeholder={t('design:colors.colorPlaceholder')}
                        className="flex-1 h-12 rounded-xl touch-target"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm font-medium">
                      {t('design:colors.secondary')}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-border"
                        style={{ backgroundColor: design.secondaryColor }}
                      />
                      <Input
                        id="secondaryColor"
                        type="text"
                        value={design.secondaryColor}
                        onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                        placeholder={t('design:colors.colorPlaceholder')}
                        className="flex-1 h-12 rounded-xl touch-target"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor" className="text-sm font-medium">
                      {t('design:colors.accent')}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-border"
                        style={{ backgroundColor: design.accentColor }}
                      />
                      <Input
                        id="accentColor"
                        type="text"
                        value={design.accentColor}
                        onChange={(e) => updateDesign({ accentColor: e.target.value })}
                        placeholder={t('design:colors.colorPlaceholder')}
                        className="flex-1 h-12 rounded-xl touch-target"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <Label htmlFor="darkBackground" className="text-sm font-medium">
                    {t('design:colors.darkBackground')}
                  </Label>
                  <Switch
                    id="darkBackground"
                    checked={design.darkBackground}
                    onCheckedChange={(checked) => updateDesign({ darkBackground: checked })}
                  />
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Typography</h3>
                
                <div>
                  <Label className="text-sm font-medium">
                    {t('design:fonts.heading')}
                  </Label>
                  <Select 
                    value={design.headingFont} 
                    onValueChange={(value: any) => updateDesign({ headingFont: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl touch-target mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span className={`font-${font.value}`}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    {t('design:fonts.body')}
                  </Label>
                  <Select 
                    value={design.bodyFont} 
                    onValueChange={(value: any) => updateDesign({ bodyFont: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl touch-target mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyFontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span className={`font-${font.value}`}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="touch-target rounded-2xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('common:global.back')}
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1 touch-target bg-gradient-primary hover:bg-primary-hover text-white rounded-2xl"
                >
                  {t('design:actions.saveAndPreview')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <div className="bg-card rounded-3xl border shadow-soft p-8 animate-slide-up">
              <h3 className="font-semibold text-lg mb-4">{t('design:preview.title')}</h3>
              
              <div 
                className="rounded-2xl p-6 min-h-[300px]"
                style={{
                  backgroundColor: design.darkBackground ? '#1f2937' : '#ffffff',
                  color: design.darkBackground ? '#f9fafb' : '#111827',
                }}
              >
                <h2 
                  className={`font-${design.headingFont} text-2xl font-bold mb-4`}
                  style={{ color: design.primaryColor }}
                >
                  {t('design:preview.sampleHeading')}
                </h2>
                <p className={`font-${design.bodyFont} mb-6 leading-relaxed`}>
                  {t('design:preview.sampleText')}
                </p>
                <button
                  className="px-6 py-3 rounded-xl font-semibold transition-colors"
                  style={{
                    backgroundColor: design.primaryColor,
                    color: design.darkBackground ? '#ffffff' : '#ffffff',
                  }}
                >
                  {t('design:preview.sampleButton')}
                </button>
              </div>
            </div>

            {/* Sitemap */}
            <div className="bg-card rounded-3xl border shadow-soft p-8 animate-slide-up">
              <h3 className="font-semibold text-lg mb-4">{t('design:sitemap.title')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {sitemapPages.map((page) => (
                  <div
                    key={page.key}
                    className="p-3 rounded-xl border bg-muted text-center text-sm font-medium"
                  >
                    {page.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Design;