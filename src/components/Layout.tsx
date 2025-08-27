import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon, Menu, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNavigate } from '@tanstack/react-router';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const handleGenerateClick = () => {
    navigate({ to: '/describe' });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate({ to: '/' })}
            >
              <img 
                src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" 
                alt={t('header.logoAlt')}
                className="h-8 w-auto object-contain shrink-0"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <span className="font-sansation font-bold text-xl text-foreground">
                Naveeg
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Button variant="ghost" onClick={() => navigate({ to: '/features' })}>
              {t('header.nav.features')}
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: '/pricing' })}>
              {t('header.nav.pricing')}
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: '/gallery' })}>
              {t('header.nav.gallery')}
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: '/faq' })}>
              {t('header.nav.faq')}
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: '/contact' })}>
              {t('header.nav.contact')}
            </Button>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Desktop Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="touch-target hidden lg:inline-flex"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Desktop Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="touch-target hidden lg:inline-flex"
                  aria-label={t('header.changeLanguage')}
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={i18n.language === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop CTA Button */}
            <Button 
              onClick={handleGenerateClick}
              className="touch-target bg-gradient-primary hover:bg-primary-hover hidden lg:inline-flex"
            >
              {t('header.generateWebsite')}
            </Button>

            {/* Mobile CTA Button - Icon Only */}
            <Button 
              onClick={handleGenerateClick}
              size="icon"
              className="touch-target bg-gradient-primary hover:bg-primary-hover lg:hidden"
              aria-label={t('header.generateWebsite')}
            >
              <Sparkles className="h-4 w-4" />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-target lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>{t('header.menu')}</SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-4">
                    <SheetClose asChild>
                      <Button variant="ghost" onClick={() => navigate({ to: '/features' })} className="justify-start">
                        {t('header.nav.features')}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" onClick={() => navigate({ to: '/pricing' })} className="justify-start">
                        {t('header.nav.pricing')}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" onClick={() => navigate({ to: '/gallery' })} className="justify-start">
                        {t('header.nav.gallery')}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" onClick={() => navigate({ to: '/faq' })} className="justify-start">
                        {t('header.nav.faq')}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" onClick={() => navigate({ to: '/contact' })} className="justify-start">
                        {t('header.nav.contact')}
                      </Button>
                    </SheetClose>
                  </nav>

                  {/* Separator */}
                  <div className="border-t border-border" />

                  {/* Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">{t('header.preferences')}</h4>
                    
                    {/* Theme Toggle */}
                    <Button
                      variant="ghost"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="justify-start w-full"
                    >
                      <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 ml-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="ml-6">{theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}</span>
                    </Button>

                    {/* Language Selection */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">{t('header.changeLanguage')}</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {languages.map((lang) => (
                          <SheetClose asChild key={lang.code}>
                            <Button
                              variant={i18n.language === lang.code ? 'secondary' : 'ghost'}
                              onClick={() => changeLanguage(lang.code)}
                              className="justify-start"
                            >
                              {lang.name}
                            </Button>
                          </SheetClose>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;