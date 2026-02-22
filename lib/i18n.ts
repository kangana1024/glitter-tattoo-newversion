export const locales = ['en', 'th', 'zh'] as const;
export const defaultLocale = 'th' as const;
export type Locale = (typeof locales)[number];
