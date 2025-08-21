import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Twitter, Linkedin, Github } from 'lucide-react';
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
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-syne font-semibold text-foreground mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2">
              <li><a href="/features" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.features')}</a></li>
              <li><a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.pricing')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.templates')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-syne font-semibold text-foreground mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.blog')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.careers')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-syne font-semibold text-foreground mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.help')}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.documentation')}</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.support')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-syne font-semibold text-foreground mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li><a href="/legal" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="/legal" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.terms')}</a></li>
              <li><a href="/legal" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.cookies')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            
            {/* Centered Logo */}
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" 
                alt={t('header.logoAlt')}
                className="h-8 w-auto"
              />
            </div>

            <div className="flex items-center space-x-6">
              {/* Social Icons */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Github className="h-4 w-4" />
                </Button>
              </div>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="touch-target"
                    aria-label={t('header.language')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;