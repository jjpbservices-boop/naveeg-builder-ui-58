import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');

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
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;