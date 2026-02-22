import * as fs from 'fs';
import * as path from 'path';
import { getAvailablePages } from '../lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.glitter-tattoo.com';
const LOCALES = ['en', 'th', 'zh'] as const;

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
  alternates: Record<string, string>;
}

/**
 * Page definitions with their priorities and change frequencies.
 */
const PAGE_CONFIG: Record<string, { priority: number; changeFrequency: string }> = {
  home: { priority: 1.0, changeFrequency: 'weekly' },
  about: { priority: 0.8, changeFrequency: 'monthly' },
  services: { priority: 0.9, changeFrequency: 'monthly' },
  gallery: { priority: 0.7, changeFrequency: 'weekly' },
  contact: { priority: 0.8, changeFrequency: 'monthly' },
};

function getPagePath(pageName: string): string {
  return pageName === 'home' ? '' : `/${pageName}`;
}

function generateSitemapData(): SitemapEntry[] {
  const pages = getAvailablePages();
  const allPages = pages.length > 0 ? pages : Object.keys(PAGE_CONFIG);
  const now = new Date().toISOString().split('T')[0];
  const entries: SitemapEntry[] = [];

  for (const pageName of allPages) {
    const config = PAGE_CONFIG[pageName] || { priority: 0.5, changeFrequency: 'monthly' };
    const pagePath = getPagePath(pageName);

    for (const locale of LOCALES) {
      const url = `${SITE_URL}/${locale}${pagePath}`;

      const alternates: Record<string, string> = {};
      for (const altLocale of LOCALES) {
        alternates[altLocale] = `${SITE_URL}/${altLocale}${pagePath}`;
      }

      entries.push({
        url,
        lastModified: now,
        changeFrequency: config.changeFrequency,
        priority: config.priority,
        alternates,
      });
    }
  }

  return entries;
}

async function main(): Promise<void> {
  process.stderr.write('Generating sitemap data...\n');

  const entries = generateSitemapData();

  const outputDir = path.join(process.cwd(), 'content');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'sitemap-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));

  process.stderr.write(`Generated sitemap data with ${entries.length} entries: content/sitemap-data.json\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
