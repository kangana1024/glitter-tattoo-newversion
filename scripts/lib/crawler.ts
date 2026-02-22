import * as cheerio from 'cheerio';
import { fetchHtml } from './downloader';
import { resolveUrl, normalizeUrl, isAllowedDomain, isSkippableHref } from './url-utils';
import { Logger } from './logger';

export interface CrawlOptions {
  startUrl: string;
  delayMs: number;
  maxPages?: number;
  verbose: boolean;
  userAgent?: string;
}

export interface PageInfo {
  url: string;
  html: string;
  localPath: string;
}

export interface ErrorInfo {
  url: string;
  error: string;
  timestamp: string;
}

export interface CrawlResult {
  pages: PageInfo[];
  imageUrls: Set<string>;
  errors: ErrorInfo[];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convert a URL to a local file path for saving.
 * / → pages/index.html, /about.html → pages/about.html
 */
function urlToLocalPath(url: string): string {
  try {
    const parsed = new URL(url);
    let pathname = parsed.pathname;
    if (pathname === '/' || pathname === '') {
      return 'pages/index.html';
    }
    // Remove leading slash
    pathname = pathname.replace(/^\//, '');
    // If no extension, treat as directory and add index.html
    if (!/\.\w+$/.test(pathname)) {
      pathname = pathname.replace(/\/$/, '') + '/index.html';
    }
    return `pages/${pathname}`;
  } catch {
    return 'pages/index.html';
  }
}

/**
 * Detect JavaScript redirects (window.location = '...') and meta refresh tags.
 * These are common on legacy sites that don't use <a> links for navigation.
 */
function extractRedirects($: cheerio.CheerioAPI, html: string, pageUrl: string): string[] {
  const redirects: string[] = [];

  // Detect <meta http-equiv="refresh" content="0;url=...">
  $('meta[http-equiv="refresh"]').each((_, el) => {
    const content = $(el).attr('content') || '';
    const match = content.match(/url\s*=\s*['"]?([^'";\s>]+)/i);
    if (match?.[1]) {
      const resolved = resolveUrl(match[1], pageUrl);
      if (resolved && isAllowedDomain(resolved)) {
        redirects.push(normalizeUrl(resolved));
      }
    }
  });

  // Detect window.location = '...' or window.location.href = '...' patterns
  // Also handles: window.location='...', location.href='...'
  const jsRedirectPatterns = [
    /window\.location\s*=\s*['"]([^'"]+)['"]/g,
    /window\.location\.href\s*=\s*['"]([^'"]+)['"]/g,
    /location\.href\s*=\s*['"]([^'"]+)['"]/g,
    /location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of jsRedirectPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1]) {
        const resolved = resolveUrl(match[1], pageUrl);
        if (resolved && isAllowedDomain(resolved)) {
          redirects.push(normalizeUrl(resolved));
        }
      }
    }
  }

  return redirects;
}

/**
 * Extract all link URLs from an HTML document.
 * Handles <a href>, <area href>, <frame src>, <iframe src>,
 * as well as JS redirects and meta refresh tags.
 */
function extractLinks($: cheerio.CheerioAPI, pageUrl: string, html: string): string[] {
  const links: string[] = [];

  const selectors = [
    { sel: 'a[href]', attr: 'href' },
    { sel: 'area[href]', attr: 'href' },
    { sel: 'frame[src]', attr: 'src' },
    { sel: 'iframe[src]', attr: 'src' },
  ];

  for (const { sel, attr } of selectors) {
    $(sel).each((_, el) => {
      const raw = $(el).attr(attr) || '';
      if (isSkippableHref(raw)) return;

      const resolved = resolveUrl(raw, pageUrl);
      if (!resolved) return;

      if (isAllowedDomain(resolved)) {
        const normalized = normalizeUrl(resolved);
        if (normalized) links.push(normalized);
      }
    });
  }

  // Also extract JS redirects and meta refresh
  const redirects = extractRedirects($, html, pageUrl);
  links.push(...redirects);

  return links;
}

/**
 * Extract all image URLs from an HTML document.
 * Handles <img src>, <img srcset>, <source srcset>, favicons,
 * inline background-image styles, and <input type="image">.
 */
function extractImages($: cheerio.CheerioAPI, pageUrl: string): string[] {
  const images: string[] = [];
  const baseUrl = pageUrl.replace(/\/[^/]*$/, '');

  function addImage(src: string): void {
    if (!src) return;
    const resolved = resolveUrl(src.trim(), baseUrl);
    if (resolved) images.push(resolved);
  }

  function parseSrcset(srcset: string): void {
    if (!srcset) return;
    const candidates = srcset.split(',');
    for (const candidate of candidates) {
      const parts = candidate.trim().split(/\s+/);
      if (parts[0]) addImage(parts[0]);
    }
  }

  // <img src> and <img srcset>
  $('img').each((_, el) => {
    addImage($(el).attr('src') || '');
    parseSrcset($(el).attr('srcset') || '');
  });

  // <source srcset> (inside <picture>)
  $('source[srcset]').each((_, el) => {
    parseSrcset($(el).attr('srcset') || '');
  });

  // Favicons
  $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').each((_, el) => {
    addImage($(el).attr('href') || '');
  });

  // <input type="image">
  $('input[type="image"]').each((_, el) => {
    addImage($(el).attr('src') || '');
  });

  // Inline style background-image
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const bgMatches = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi);
    if (bgMatches) {
      for (const match of bgMatches) {
        const urlMatch = match.match(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/i);
        if (urlMatch?.[1]) addImage(urlMatch[1]);
      }
    }
  });

  return images;
}

/**
 * Recursively crawl a website using BFS, discovering pages and collecting image URLs.
 */
export async function crawlSite(options: CrawlOptions, logger: Logger): Promise<CrawlResult> {
  const { startUrl, delayMs, maxPages, verbose } = options;

  const visited = new Set<string>();
  const queue: string[] = [normalizeUrl(startUrl)];
  const pages: PageInfo[] = [];
  const imageUrls = new Set<string>();
  const errors: ErrorInfo[] = [];

  logger.info(`Starting crawl from ${startUrl}`);

  while (queue.length > 0) {
    if (maxPages !== undefined && pages.length >= maxPages) {
      logger.info(`Reached max pages limit (${maxPages})`);
      break;
    }

    const url = queue.shift()!;
    const normalized = normalizeUrl(url);

    if (visited.has(normalized)) continue;
    visited.add(normalized);

    logger.verbose(`Crawling: ${normalized}`);

    try {
      const result = await fetchHtml(normalized, {
        rateLimitMs: delayMs,
        maxRetries: 3,
        verbose,
      });

      const $ = cheerio.load(result.html);

      // Extract and queue links
      const links = extractLinks($, normalized, result.html);
      for (const link of links) {
        const norm = normalizeUrl(link);
        if (norm && !visited.has(norm)) {
          queue.push(norm);
        }
      }

      // Extract image URLs
      const imgs = extractImages($, normalized);
      for (const img of imgs) {
        imageUrls.add(img);
      }

      pages.push({
        url: normalized,
        html: result.html,
        localPath: urlToLocalPath(normalized),
      });

      logger.progress(pages.length, maxPages ?? 0, `Crawled ${normalized}`);

      // Rate limit
      if (queue.length > 0) {
        await delay(delayMs);
      }
    } catch (error) {
      const errMsg = (error as Error).message;
      logger.error(`Failed to crawl ${normalized}: ${errMsg}`);
      errors.push({
        url: normalized,
        error: errMsg,
        timestamp: new Date().toISOString(),
      });
    }
  }

  logger.success(`Crawl complete: ${pages.length} pages, ${imageUrls.size} images, ${errors.length} errors`);

  return { pages, imageUrls, errors };
}
