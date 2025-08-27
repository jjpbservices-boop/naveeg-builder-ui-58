import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon, Menu, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';
import { HeroAnimation } from '@/components/HeroAnimation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navigation = [
    { name: 'Pricing', href: '/pricing' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleGenerateClick = () => {
    navigate({ to: '/onboarding/brief' });
  };

  // Check if current route is an onboarding page
  const currentPath = window.location.pathname;
  const isOnboardingPage = currentPath.includes('/brief') || 
                          currentPath.includes('/design') || 
                          currentPath.includes('/generating') || 
                          currentPath.includes('/generate') || 
                          currentPath.includes('/ready');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate({ to: '/' })}
            >
              <img 
                src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" 
                alt="Naveeg" 
                className="h-6 sm:h-8 w-auto"
              />
              <span className="font-sansation text-lg sm:text-xl font-bold text-foreground">Naveeg</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate({ to: item.href })}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 px-3">
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="text-sm">{currentLanguage.flag}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <span className="mr-2">{language.flag}</span>
                        {language.name}
                      </span>
                      {i18n.language === language.code && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9 p-0">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* CTA Button */}
              <Button 
                onClick={handleGenerateClick}
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Free
              </Button>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Theme Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9 p-0">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <img 
                        src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" 
                        alt="Naveeg" 
                        className="h-6 w-auto"
                      />
                      <span className="font-sansation text-lg font-bold">Naveeg</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-8 space-y-6">
                    {/* Navigation Links */}
                    <nav className="space-y-4">
                      {navigation.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            navigate({ to: item.href });
                            setIsSheetOpen(false);
                          }}
                          className="block text-muted-foreground hover:text-foreground transition-colors text-base font-medium w-full text-left"
                        >
                          {item.name}
                        </button>
                      ))}
                    </nav>

                    {/* Language Selector */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Language</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                              i18n.language === language.code
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            <span>{language.flag}</span>
                            <span className="text-sm">{language.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      onClick={() => {
                        handleGenerateClick();
                        setIsSheetOpen(false);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Try Free
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${isOnboardingPage ? 'bg-gradient-to-br from-background via-muted/30 to-background pt-14 sm:pt-16 relative' : ''}`}>
        {isOnboardingPage && <HeroAnimation />}
        <div className={isOnboardingPage ? 'relative z-10' : ''}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
};

export default Layout;