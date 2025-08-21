import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from '@tanstack/react-router';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
                src="/brand-logo.png" 
                alt={t('header.logoAlt')}
                className="h-8 w-auto object-contain shrink-0"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <span className="font-syne font-semibold text-xl text-foreground">
                Naveeg
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="touch-target"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="touch-target"
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

            {/* CTA Button */}
            <Button 
              onClick={handleGenerateClick}
              className="touch-target bg-gradient-primary hover:bg-primary-hover"
            >
              {t('header.generateWebsite')}
            </Button>
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