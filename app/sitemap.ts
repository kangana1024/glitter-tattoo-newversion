import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';

export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.glitter-tattoo.com';

const pages = ['', '/about', '/services', '/gallery', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const url = `${SITE_URL}/${locale}${page}`;
      const alternates: Record<string, string> = {};
      for (const alt of locales) {
        alternates[alt] = `${SITE_URL}/${alt}${page}`;
      }

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  return entries;
}
