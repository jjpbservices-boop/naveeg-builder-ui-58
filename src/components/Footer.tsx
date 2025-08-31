import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Twitter, Linkedin, Github, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation('common');

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

  return (
    <footer className="relative bg-clean-light border-clean-top pt-16 pb-12">
      <div className="container-clean">
        {/* Main Footer Content */}
        <div className="grid-clean-4 mb-12">
          {/* Company Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" 
                alt="Naveeg" 
                className="h-8 w-auto"
              />
              <span className="font-sansation text-xl font-bold text-foreground">Naveeg</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Build your business website as easily as sending an email. No technical skills required.
            </p>
          </div>
          
          {/* For Business Owners */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-base">For Business Owners</h3>
            <ul className="space-y-3">
              <li><a href="/features" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">How It Works</a></li>
              <li><a href="/pricing" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Pricing</a></li>
              <li><a href="/gallery" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Website Examples</a></li>
              <li><a href="/blog" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Business Tips</a></li>
            </ul>
          </div>
          
          {/* Help & Support */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-base">Help & Support</h3>
            <ul className="space-y-3">
              <li><a href="/help" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
              <li><a href="/contact" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Contact Us</a></li>
              <li><a href="/support" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Live Chat</a></li>
              <li><a href="/faq" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">FAQ</a></li>
            </ul>
          </div>
          
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-base">Company</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">About Naveeg</a></li>
              <li><a href="/legal" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Privacy Policy</a></li>
              <li><a href="/legal" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Terms of Service</a></li>
              <li><a href="/careers" className="text-sm text-muted-foreground hover-clean-link transition-all duration-300 hover:translate-x-1 inline-block">Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-clean-top">
          <div className="flex-clean-between gap-6">
            {/* Copyright & Legal */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 Naveeg. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <a href="/legal" className="hover-clean-link transition-colors duration-200">Privacy</a>
                <a href="/legal" className="hover-clean-link transition-colors duration-200">Terms</a>
                <a href="/legal" className="hover-clean-link transition-colors duration-200">Cookies</a>
              </div>
            </div>

            {/* Social & Language */}
            <div className="flex items-center gap-4">
              {/* Social Icons */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-full">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-full">
                  <Github className="h-4 w-4" />
                </Button>
              </div>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-3 text-xs hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                  >
                    <Globe className="mr-2 h-3 w-3" />
                    {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
                    <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 border-border/50 shadow-xl bg-background/95 backdrop-blur">
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className="flex items-center justify-between hover:bg-muted/50 transition-colors duration-200 cursor-pointer text-sm"
                    >
                      <span>{language.name}</span>
                      {i18n.language === language.code && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;