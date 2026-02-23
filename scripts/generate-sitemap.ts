import * as fs from 'fs';
import * as path from 'path';
import { getAvailablePages } from '../lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.glitter-tattoo.com';
const LOCALES = ['en', 'th', 'zh'] as const;
const LEGACY_INDEX_PATH = path.join(process.cwd(), 'content', 'legacy', 'pages.json');

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

  // 1. Main curated pages
  for (const pageName of allPages) {
    const config = PAGE_CONFIG[pageName] || { priority: 0.5, changeFrequency: 'monthly' };
    const pagePath = getPagePath(pageName);

    for (const locale of LOCALES) {
      const url = `${SITE_URL}/${locale}${pagePath}/`;
      const alternates: Record<string, string> = {};
      for (const altLocale of LOCALES) {
        alternates[altLocale] = `${SITE_URL}/${altLocale}${pagePath}/`;
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

  // 2. Legacy pages from parsed content
  if (fs.existsSync(LEGACY_INDEX_PATH)) {
    const legacyIndex = JSON.parse(fs.readFileSync(LEGACY_INDEX_PATH, 'utf-8'));
    const legacyGroups: string[] = legacyIndex.groups || [];
    const groupsDir = path.join(process.cwd(), 'content', 'legacy', 'groups');

    for (const groupName of legacyGroups) {
      const groupFile = path.join(groupsDir, `${groupName}.json`);
      if (!fs.existsSync(groupFile)) continue;

      const group = JSON.parse(fs.readFileSync(groupFile, 'utf-8'));
      const canonicalPath = group.canonicalPath || group.urlPaths?.[0];
      if (!canonicalPath) continue;

      for (const locale of LOCALES) {
        const url = `${SITE_URL}/${locale}${canonicalPath}`;
        const alternates: Record<string, string> = {};
        for (const altLocale of LOCALES) {
          alternates[altLocale] = `${SITE_URL}/${altLocale}${canonicalPath}`;
        }

        entries.push({
          url,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.4,
          alternates,
        });
      }
    }
  }

  return entries;
}

function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const alternateLinks = Object.entries(entry.alternates)
      .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />`)
      .join('\n');

    return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
${alternateLinks}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
}

async function main(): Promise<void> {
  process.stderr.write('=== Generating Sitemap ===\n');

  const entries = generateSitemapData();

  // Save JSON data
  const contentDir = path.join(process.cwd(), 'content');
  fs.mkdirSync(contentDir, { recursive: true });
  const jsonPath = path.join(contentDir, 'sitemap-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(entries, null, 2));

  // Save XML sitemap to public/
  const xmlContent = generateSitemapXml(entries);
  const xmlPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(xmlPath, xmlContent);

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`  Entries: ${entries.length}\n`);
  process.stderr.write(`  JSON:    ${jsonPath}\n`);
  process.stderr.write(`  XML:     ${xmlPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
