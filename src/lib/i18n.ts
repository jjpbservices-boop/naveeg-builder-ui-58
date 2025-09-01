import en from '@/content/i18n/en.json';
import pt from '@/content/i18n/pt.json';
import fr from '@/content/i18n/fr.json';
import es from '@/content/i18n/es.json';
import it from '@/content/i18n/it.json';

export const locales = {
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = 'en';

const translations = {
  en,
  pt,
  fr,
  es,
  it,
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations[defaultLocale];
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const locale = segments[1] as Locale;
  
  if (locale && locales[locale]) {
    return locale;
  }
  
  return defaultLocale;
}

export function getPathnameWithLocale(pathname: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return pathname;
  }
  
  const segments = pathname.split('/');
  segments[1] = locale;
  return segments.join('/');
}
