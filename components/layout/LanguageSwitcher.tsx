'use client';

import { usePathname, useRouter } from '@/lib/navigation';
import { locales, type Locale } from '@/lib/i18n';
import { useLocale } from 'next-intl';

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  th: 'TH',
  zh: '中文',
};

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function handleLocaleChange(locale: Locale) {
    router.replace(pathname, { locale });
  }

  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`px-2 py-1 text-sm font-heading font-semibold rounded transition-colors duration-200 ${
            locale === currentLocale
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:text-primary hover:bg-primary/10'
          }`}
          aria-label={`Switch to ${localeLabels[locale]}`}
          aria-current={locale === currentLocale ? 'true' : undefined}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
