import * as fs from 'fs';
import * as path from 'path';
import type { Locale } from './i18n';

export interface PageContentData {
  name: string;
  title: Record<string, string>;
  description: Record<string, string>;
  sections: {
    locale: string;
    headings: string[];
    bodyText: string;
    images: { src: string; alt: string }[];
  }[];
  images: { src: string; alt: string }[];
}

export interface LocalizedPageContent {
  title: string;
  description: string;
  headings: string[];
  bodyText: string;
  images: { src: string; alt: string }[];
  ogImage?: string;
}

const contentCache = new Map<string, PageContentData>();

/**
 * Load raw page content JSON from content/pages/{pageName}.json.
 */
function loadRawContent(pageName: string): PageContentData | null {
  const cacheKey = pageName;
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }

  const filePath = path.join(process.cwd(), 'content', 'pages', `${pageName}.json`);

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as PageContentData;
    contentCache.set(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

/**
 * Load localized page content for a specific page and locale.
 * Falls back to Thai (default) if the requested locale is unavailable,
 * then falls back to a minimal placeholder if no data exists.
 */
export function loadPageContent(pageName: string, locale: string): LocalizedPageContent {
  const data = loadRawContent(pageName);

  if (!data) {
    return {
      title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
      description: '',
      headings: [],
      bodyText: '',
      images: [],
    };
  }

  const title = data.title[locale] || data.title['th'] || data.title['en'] || pageName;
  const description = data.description[locale] || data.description['th'] || data.description['en'] || '';

  const localeSection = data.sections.find((s) => s.locale === locale)
    || data.sections.find((s) => s.locale === 'th')
    || data.sections[0];

  const headings = localeSection?.headings || [];
  const bodyText = localeSection?.bodyText || '';
  const sectionImages = localeSection?.images || [];

  const images = sectionImages.length > 0 ? sectionImages : data.images || [];
  const ogImage = images.length > 0 ? images[0].src : undefined;

  return {
    title,
    description,
    headings,
    bodyText,
    images,
    ogImage,
  };
}

/**
 * Get all available page names by scanning content/pages/ directory.
 */
export function getAvailablePages(): string[] {
  const pagesDir = path.join(process.cwd(), 'content', 'pages');

  try {
    return fs
      .readdirSync(pagesDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}
