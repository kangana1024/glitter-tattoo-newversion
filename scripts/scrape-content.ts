import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

export interface PageContent {
  url: string;
  title: string;
  description: string;
  headings: string[];
  bodyHtml: string;
  bodyText: string;
  images: { src: string; alt: string }[];
  links: { href: string; text: string }[];
  locale: string;
}

const BASE_URL = process.env.SCRAPE_TARGET_URL || 'https://www.glitter-tattoo.com';
const RATE_LIMIT_MS = 500;
const MAX_RETRIES = 3;

const PAGES_TO_SCRAPE = [
  { path: '/', name: 'home', locale: 'th' },
  { path: '/home_en.html', name: 'home', locale: 'en' },
  { path: '/home_ch.html', name: 'home', locale: 'zh' },
  { path: '/2015/about.html', name: 'about', locale: 'th' },
  { path: '/2015/about_en.html', name: 'about', locale: 'en' },
  { path: '/2015/about_ch.html', name: 'about', locale: 'zh' },
  { path: '/2015/products.html', name: 'services', locale: 'th' },
  { path: '/2015/products_en.html', name: 'services', locale: 'en' },
  { path: '/2015/products_ch.html', name: 'services', locale: 'zh' },
  { path: '/2015/gallery.html', name: 'gallery', locale: 'th' },
  { path: '/2015/gallery_en.html', name: 'gallery', locale: 'en' },
  { path: '/2015/gallery_ch.html', name: 'gallery', locale: 'zh' },
  { path: '/2015/contact.html', name: 'contact', locale: 'th' },
  { path: '/2015/contact_en.html', name: 'contact', locale: 'en' },
  { path: '/2015/contact_ch.html', name: 'contact', locale: 'zh' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        const backoff = RATE_LIMIT_MS * Math.pow(2, attempt - 1);
        process.stderr.write(`  Retry ${attempt}/${MAX_RETRIES} for ${url} (waiting ${backoff}ms)\n`);
        await delay(backoff);
      }
    }
  }

  throw lastError;
}

function resolveUrl(src: string): string {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('//')) return `https:${src}`;
  if (src.startsWith('/')) return `${BASE_URL}${src}`;
  return `${BASE_URL}/${src}`;
}

export function parsePage(html: string, url: string, locale: string): PageContent {
  const $ = cheerio.load(html);

  return {
    url,
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    headings: $('h1, h2, h3')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean),
    bodyHtml: $('body').html() || '',
    bodyText: $('body').text().replace(/\s+/g, ' ').trim(),
    images: $('img')
      .map((_, el) => ({
        src: resolveUrl($(el).attr('src') || ''),
        alt: $(el).attr('alt') || '',
      }))
      .get()
      .filter((img) => img.src),
    links: $('a[href]')
      .map((_, el) => ({
        href: $(el).attr('href') || '',
        text: $(el).text().trim(),
      }))
      .get(),
    locale,
  };
}

export async function scrapeAllPages(): Promise<Map<string, PageContent[]>> {
  const results = new Map<string, PageContent[]>();

  for (const page of PAGES_TO_SCRAPE) {
    const url = `${BASE_URL}${page.path}`;
    process.stderr.write(`Scraping: ${url}\n`);

    try {
      const html = await fetchWithRetry(url);
      const content = parsePage(html, url, page.locale);

      if (!results.has(page.name)) {
        results.set(page.name, []);
      }
      results.get(page.name)!.push(content);

      await delay(RATE_LIMIT_MS);
    } catch (error) {
      process.stderr.write(`  Failed to scrape ${url}: ${(error as Error).message}\n`);
    }
  }

  return results;
}

function buildPageJson(pageName: string, contents: PageContent[]): Record<string, unknown> {
  const localeData: Record<string, { title: string; description: string; headings: string[]; bodyText: string; images: { src: string; alt: string }[] }> = {};

  for (const content of contents) {
    localeData[content.locale] = {
      title: content.title,
      description: content.description,
      headings: content.headings,
      bodyText: content.bodyText,
      images: content.images,
    };
  }

  return {
    name: pageName,
    title: {
      en: localeData['en']?.title || pageName,
      th: localeData['th']?.title || pageName,
      zh: localeData['zh']?.title || pageName,
    },
    description: {
      en: localeData['en']?.description || '',
      th: localeData['th']?.description || '',
      zh: localeData['zh']?.description || '',
    },
    sections: Object.entries(localeData).map(([locale, data]) => ({
      locale,
      headings: data.headings,
      bodyText: data.bodyText,
      images: data.images,
    })),
    images: contents.flatMap((c) => c.images).filter(
      (img, i, arr) => arr.findIndex((x) => x.src === img.src) === i
    ),
  };
}

export async function saveScrapedContent(results: Map<string, PageContent[]>): Promise<void> {
  const scrapedDir = path.join(process.cwd(), 'content', 'scraped');
  const pagesDir = path.join(process.cwd(), 'content', 'pages');

  fs.mkdirSync(scrapedDir, { recursive: true });
  fs.mkdirSync(pagesDir, { recursive: true });

  for (const [pageName, contents] of results) {
    // Save raw scraped data
    fs.writeFileSync(
      path.join(scrapedDir, `${pageName}.json`),
      JSON.stringify(contents, null, 2)
    );

    // Save processed page content
    const pageJson = buildPageJson(pageName, contents);
    fs.writeFileSync(
      path.join(pagesDir, `${pageName}.json`),
      JSON.stringify(pageJson, null, 2)
    );

    process.stderr.write(`Saved: content/pages/${pageName}.json\n`);
  }
}

export function collectAllImageUrls(results: Map<string, PageContent[]>): string[] {
  const urls = new Set<string>();
  for (const contents of results.values()) {
    for (const content of contents) {
      for (const img of content.images) {
        if (img.src) urls.add(img.src);
      }
    }
  }
  return Array.from(urls);
}

// Run directly
if (require.main === module || process.argv[1]?.endsWith('scrape-content.ts')) {
  (async () => {
    process.stderr.write('Starting content scrape...\n');
    const results = await scrapeAllPages();
    await saveScrapedContent(results);
    process.stderr.write(`Done. Scraped ${results.size} pages.\n`);
  })().catch((err) => {
    process.stderr.write(`Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}
