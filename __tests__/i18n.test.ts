import { locales, defaultLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

describe('i18n config', () => {
  it('exports locales array with en, th, zh', () => {
    expect(locales).toEqual(['en', 'th', 'zh']);
  });

  it('sets defaultLocale to th', () => {
    expect(defaultLocale).toBe('th');
  });

  it('Locale type accepts valid locales', () => {
    const locale: Locale = 'en';
    expect(locales).toContain(locale);
  });
});
