export const defaultLocale = 'ja' as const;
export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
};

/** Reserved slugs that must not be used as app names (includes locale codes). */
export const reservedSlugs = new Set<string>([...locales, 'support', 'privacy', 'terms', 'index', 'og']);
