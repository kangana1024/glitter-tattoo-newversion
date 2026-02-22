const DEFAULT_BASE_URL = process.env.SCRAPE_TARGET_URL || 'https://www.glitter-tattoo.com';

const ALLOWED_DOMAINS = [
  'glitter-tattoo.com',
  'www.glitter-tattoo.com',
];

/**
 * Mapping rules: convert old legacy paths to new paths.
 */
const PATH_RULES: Array<{ match: RegExp; newPath: string }> = [
  { match: /^\/(index|home)\.html?$/i, newPath: '/' },
  { match: /^\/home_(en|ch)\.html?$/i, newPath: '/' },
  { match: /^\/2015\/?(index\.html)?$/i, newPath: '/' },
  { match: /^\/2015\/about(_en|_ch)?\.html?$/i, newPath: '/about' },
  { match: /^\/about\.html?$/i, newPath: '/about' },
  { match: /^\/2015\/products(_en|_ch)?\.html?$/i, newPath: '/services' },
  { match: /^\/products?\.html?$/i, newPath: '/services' },
  { match: /^\/2015\/gallery(_en|_ch)?\.html?$/i, newPath: '/gallery' },
  { match: /^\/gallery\.html?$/i, newPath: '/gallery' },
  { match: /^\/2015\/contact(_en|_ch)?\.html?$/i, newPath: '/contact' },
  { match: /^\/contact\.html?$/i, newPath: '/contact' },
];

/**
 * Resolve a potentially relative URL against a base URL.
 * Returns the fully-qualified URL string, or empty string if invalid.
 */
export function resolveUrl(src: string, baseUrl: string = DEFAULT_BASE_URL): string {
  if (!src) return '';
  try {
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('//')) return `https:${src}`;
    if (src.startsWith('/')) return `${baseUrl.replace(/\/+$/, '')}${src}`;
    return `${baseUrl.replace(/\/+$/, '')}/${src}`;
  } catch {
    return '';
  }
}

/**
 * Normalize a URL by stripping query strings, fragments,
 * and trailing slashes (except for root '/').
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    let pathname = parsed.pathname.split('?')[0].split('#')[0];
    // Remove trailing slash except for root
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.replace(/\/+$/, '');
    }
    return `${parsed.protocol}//${parsed.host}${pathname}`;
  } catch {
    // If not a full URL, normalize as a path
    let cleaned = url.split('?')[0].split('#')[0];
    if (cleaned.length > 1 && cleaned.endsWith('/')) {
      cleaned = cleaned.replace(/\/+$/, '');
    }
    return cleaned;
  }
}

/**
 * Extract the pathname from a URL string.
 * Returns the path or null if parsing fails.
 */
export function extractPathname(url: string): string | null {
  if (!url) return null;
  try {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      const parsed = new URL(url.startsWith('//') ? `https:${url}` : url);
      return parsed.pathname;
    }
    // Already a path
    if (url.startsWith('/')) return url.split('?')[0].split('#')[0];
    return null;
  } catch {
    return null;
  }
}

/**
 * Check whether a URL belongs to one of the allowed domains.
 */
export function isAllowedDomain(url: string): boolean {
  if (!url) return false;
  try {
    // Relative paths are always allowed
    if (url.startsWith('/') && !url.startsWith('//')) return true;

    const fullUrl = url.startsWith('//') ? `https:${url}` : url;
    const parsed = new URL(fullUrl);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/**
 * Check if a href should be skipped (mailto, tel, javascript, anchors, etc.)
 */
export function isSkippableHref(href: string): boolean {
  if (!href) return true;
  const trimmed = href.trim();
  return (
    trimmed === '#' ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:')
  );
}

/**
 * Map an old legacy path to its new equivalent.
 * Returns the new path or null if no rule matches.
 */
export function mapPathToNew(oldPath: string): string | null {
  const cleaned = oldPath.split('?')[0].split('#')[0];
  for (const rule of PATH_RULES) {
    if (rule.match.test(cleaned)) {
      return rule.newPath;
    }
  }
  return null;
}

/**
 * Determine the locale from a legacy URL path.
 * Returns 'en', 'zh', or 'th' (default).
 */
export function detectLocaleFromPath(urlPath: string): string {
  if (/_en\.html?$/i.test(urlPath)) return 'en';
  if (/_ch\.html?$/i.test(urlPath)) return 'zh';
  return 'th';
}
