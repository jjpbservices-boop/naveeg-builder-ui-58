import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale files for full translations
import commonEn from '@/locales/en/common.json';
import onboardingEn from '@/locales/en/onboarding.json';
import designEn from '@/locales/en/design.json';
import progressEn from '@/locales/en/progress.json';
import previewEn from '@/locales/en/preview.json';
import dashboardEn from '@/locales/en/dashboard.json';
import analyticsEn from '@/locales/en/analytics.json';
import domainEn from '@/locales/en/domain.json';
import backupEn from '@/locales/en/backup.json';
import cacheEn from '@/locales/en/cache.json';
import securityEn from '@/locales/en/security.json';
import workspaceEn from '@/locales/en/workspace.json';
import billingEn from '@/locales/en/billing.json';
import errorsEn from '@/locales/en/errors.json';

import commonFr from '@/locales/fr/common.json';
import onboardingFr from '@/locales/fr/onboarding.json';
import designFr from '@/locales/fr/design.json';
import progressFr from '@/locales/fr/progress.json';
import previewFr from '@/locales/fr/preview.json';
import dashboardFr from '@/locales/fr/dashboard.json';
import analyticsFr from '@/locales/fr/analytics.json';
import domainFr from '@/locales/fr/domain.json';
import backupFr from '@/locales/fr/backup.json';
import cacheFr from '@/locales/fr/cache.json';
import securityFr from '@/locales/fr/security.json';
import workspaceFr from '@/locales/fr/workspace.json';
import billingFr from '@/locales/fr/billing.json';
import errorsFr from '@/locales/fr/errors.json';

// Supported locales
export const supportedLocales = [
  'en', 'fr', 'es', 'pt', 'it', 'de', 'nl', 'pl', 'sv', 'da', 'fi', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'et', 'lv', 'lt', 'mt'
] as const;

export type SupportedLocale = typeof supportedLocales[number];

const resources = {
  en: {
    common: commonEn,
    onboarding: onboardingEn,
    design: designEn,
    progress: progressEn,
    preview: previewEn,
    dashboard: dashboardEn,
    analytics: analyticsEn,
    domain: domainEn,
    backup: backupEn,
    cache: cacheEn,
    security: securityEn,
    workspace: workspaceEn,
    billing: billingEn,
    errors: errorsEn,
  },
  fr: {
    common: commonFr,
    onboarding: onboardingFr,
    design: designFr,
    progress: progressFr,
    preview: previewFr,
    dashboard: dashboardFr,
    analytics: analyticsFr,
    domain: domainFr,
    backup: backupFr,
    cache: cacheFr,
    security: securityFr,
    workspace: workspaceFr,
    billing: billingFr,
    errors: errorsFr,
  }
  // Other locales will be lazy-loaded with fallback to English
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'naveeg-language',
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },

    ns: ['common', 'onboarding', 'design', 'progress', 'preview', 'dashboard', 'analytics', 'domain', 'backup', 'cache', 'security', 'workspace', 'billing', 'errors'],
    defaultNS: 'common',
  });

export default i18n;
