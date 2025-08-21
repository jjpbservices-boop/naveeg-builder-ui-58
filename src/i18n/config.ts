import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale files for full translations
import commonEn from '@/locales/en/common.json';
import homeEn from '@/locales/en/home.json';
import featuresEn from '@/locales/en/features.json';
import pricingEn from '@/locales/en/pricing.json';
import galleryEn from '@/locales/en/gallery.json';
import faqEn from '@/locales/en/faq.json';
import contactEn from '@/locales/en/contact.json';
import legalEn from '@/locales/en/legal.json';
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
import homeFr from '@/locales/fr/home.json';
import featuresFr from '@/locales/fr/features.json';
import pricingFr from '@/locales/fr/pricing.json';
import galleryFr from '@/locales/fr/gallery.json';
import faqFr from '@/locales/fr/faq.json';
import contactFr from '@/locales/fr/contact.json';
import legalFr from '@/locales/fr/legal.json';
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

// Import ES/PT/IT locale files
import commonEs from '@/locales/es/common.json';
import featuresEs from '@/locales/es/features.json';

import commonPt from '@/locales/pt/common.json';
import featuresPt from '@/locales/pt/features.json';

import commonIt from '@/locales/it/common.json';
import featuresIt from '@/locales/it/features.json';

// Supported locales
export const supportedLocales = [
  'en', 'fr', 'es', 'pt', 'it'
] as const;

export type SupportedLocale = typeof supportedLocales[number];

const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    features: featuresEn,
    pricing: pricingEn,
    gallery: galleryEn,
    faq: faqEn,
    contact: contactEn,
    legal: legalEn,
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
    home: homeFr,
    features: featuresFr,
    pricing: pricingFr,
    gallery: galleryFr,
    faq: faqFr,
    contact: contactFr,
    legal: legalFr,
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
  },
  es: {
    common: commonEs,
    features: featuresEs,
    // Real Spanish translations with EN fallback for missing
    home: homeEn,
    pricing: pricingEn,
    gallery: galleryEn,
    faq: faqEn,
    contact: contactEn,
    legal: legalEn,
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
  pt: {
    common: commonPt,
    features: featuresPt,
    // Real Portuguese translations with EN fallback for missing
    home: homeEn,
    pricing: pricingEn,
    gallery: galleryEn,
    faq: faqEn,
    contact: contactEn,
    legal: legalEn,
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
  it: {
    common: commonIt,
    features: featuresIt,
    // Real Italian translations with EN fallback for missing
    home: homeEn,
    pricing: pricingEn,
    gallery: galleryEn,
    faq: faqEn,
    contact: contactEn,
    legal: legalEn,
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
  }
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
      order: ['querystring', 'path', 'localStorage', 'navigator', 'htmlTag', 'cookie'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'naveeg-language',
      lookupCookie: 'naveeg-language',
      caches: ['localStorage', 'cookie'],
    },

    react: {
      useSuspense: false,
    },

    ns: ['common', 'home', 'features', 'pricing', 'gallery', 'faq', 'contact', 'legal', 'onboarding', 'design', 'progress', 'preview', 'dashboard', 'analytics', 'domain', 'backup', 'cache', 'security', 'workspace', 'billing', 'errors'],
    defaultNS: 'common',
  });

export default i18n;