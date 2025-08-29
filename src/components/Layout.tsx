import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon, Menu, Sparkles, Check, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';
import { HeroAnimation } from '@/components/HeroAnimation';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];
  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => i18n.changeLanguage(code);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const navigation = [
    { name: 'Pricing', href: '/pricing' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleGenerateClick = () => navigate({ to: '/onboarding/brief' });
  const handleLoginClick = () => navigate({ to: '/auth' });

  const p = location.pathname;
  const isOnboardingPage =
    p.includes('/onboarding') || p.includes('/generating') || p.includes('/generate') || p.includes('/ready') || p.includes('/describe');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate({ to: '/' })}>
              <img src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" alt="Naveeg" className="h-6 sm:h-8 w-auto" />
              <span className="font-sansation text-lg sm:text-xl font-bold text-foreground">Naveeg</span>
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map(item => (
                <button key={item.name} onClick={() => navigate({ to: item.href })}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><Globe className="mr-2" /><span>{currentLanguage.name}</span></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {languages.map(language => (
                    <DropdownMenuItem key={language.code} onClick={() => changeLanguage(language.code)} className="flex items-center justify-between">
                      <span>{language.name}</span>
                      {i18n.language === language.code && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm-icon" onClick={handleLoginClick}><LogIn /></Button>

              <Button variant="ghost" size="sm-icon" onClick={toggleTheme}>
                <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Button onClick={handleGenerateClick} className="bg-primary hover:bg-primary/90 text-white font-semibold">
                <Sparkles className="mr-2" />Try Free
              </Button>
            </div>

            <div className="flex lg:hidden items-center space-x-2">
              <Button variant="ghost" size="sm-icon" onClick={toggleTheme}>
                <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm-icon"><Menu /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <img src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" alt="Naveeg" className="h-6 w-auto" />
                      <span className="font-sansation text-lg font-bold">Naveeg</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-6">
                    <nav className="space-y-4">
                      {navigation.map(item => (
                        <button key={item.name}
                          onClick={() => { navigate({ to: item.href }); setIsSheetOpen(false); }}
                          className="block text-muted-foreground hover:text-foreground transition-colors text-base font-medium w-full text-left">
                          {item.name}
                        </button>
                      ))}
                    </nav>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Language</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {languages.map(language => (
                          <button key={language.code} onClick={() => changeLanguage(language.code)}
                            className={`flex items-center justify-center p-2 rounded-lg border transition-colors ${
                              i18n.language === language.code ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-muted'
                            }`}>
                            <span className="text-sm">{language.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={() => { handleLoginClick(); setIsSheetOpen(false); }} variant="outline" className="w-full">
                      <LogIn className="mr-2" />Login
                    </Button>

                    <Button onClick={() => { handleGenerateClick(); setIsSheetOpen(false); }}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                      <Sparkles className="mr-2" />Try Free
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        className={
          isOnboardingPage
            ? // isolate and floor width; keep header offset here
              'flex-1 relative overflow-hidden min-w-[320px] pt-14 sm:pt-16 bg-gradient-to-br from-background via-muted/30 to-background [contain:layout_paint]'
            : 'flex-1'
        }
      >
        {isOnboardingPage && (
          <div
            className="absolute inset-0 -z-10 pointer-events-none [contain:layout_paint]"
            aria-hidden="true"
          >
            <HeroAnimation />
          </div>
        )}
        <div className={isOnboardingPage ? 'relative z-10' : ''}>{children}</div>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
};

export default Layout;