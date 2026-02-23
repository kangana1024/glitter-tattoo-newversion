import * as fs from 'fs';
import * as path from 'path';

export interface LegacyPageContent {
  urlPath: string;
  filePath: string;
  locale: string;
  groupName: string;
  title: string;
  description: string;
  keywords: string;
  headings: string[];
  bodyText: string;
  bodyHtml: string;
  images: Array<{ src: string; alt: string }>;
}

export interface LegacyPageGroup {
  groupName: string;
  urlPaths: string[];
  locales: Record<string, LegacyPageContent>;
  canonicalPath: string;
  keywords: string[];
  images: Array<{ src: string; alt: string }>;
}

export interface LegacyPagesIndex {
  generatedAt: string;
  totalPages: number;
  totalGroups: number;
  pathToGroup: Record<string, string>;
  groups: string[];
  paths: string[];
}

export interface ImageManifestEntry {
  original: string;
  variants: Array<{
    width: number;
    webp: string;
    fallback: string;
  }>;
  srcset: string;
  fallbackSrc: string;
}

type ImageManifest = Record<string, ImageManifestEntry>;

// Caches
let indexCache: LegacyPagesIndex | null = null;
const groupCache = new Map<string, LegacyPageGroup>();
let imageManifestCache: ImageManifest | null = null;

/**
 * Load the legacy pages index.
 */
export function loadLegacyIndex(): LegacyPagesIndex | null {
  if (indexCache) return indexCache;

  const filePath = path.join(process.cwd(), 'content', 'legacy', 'pages.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    indexCache = JSON.parse(raw) as LegacyPagesIndex;
    return indexCache;
  } catch {
    return null;
  }
}

/**
 * Load a legacy page group by name.
 */
export function loadLegacyGroup(groupName: string): LegacyPageGroup | null {
  if (groupCache.has(groupName)) return groupCache.get(groupName)!;

  const filePath = path.join(process.cwd(), 'content', 'legacy', 'groups', `${groupName}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const group = JSON.parse(raw) as LegacyPageGroup;
    groupCache.set(groupName, group);
    return group;
  } catch {
    return null;
  }
}

/**
 * Get legacy page content by its original URL path.
 * Returns the group and the locale-specific content.
 */
export function getLegacyPageByPath(
  urlPath: string,
  locale: string,
): { group: LegacyPageGroup; content: LegacyPageContent } | null {
  const index = loadLegacyIndex();
  if (!index) return null;

  const groupName = index.pathToGroup[urlPath];
  if (!groupName) return null;

  const group = loadLegacyGroup(groupName);
  if (!group) return null;

  // Try requested locale, then detect from URL, then fallback
  const content = group.locales[locale]
    || group.locales['th']
    || group.locales['en']
    || Object.values(group.locales)[0];

  if (!content) return null;

  return { group, content };
}

/**
 * Check if a URL path is a legacy page.
 */
export function isLegacyPath(urlPath: string): boolean {
  const index = loadLegacyIndex();
  if (!index) return false;
  return urlPath in index.pathToGroup;
}

/**
 * Get all legacy paths for generateStaticParams.
 */
export function getAllLegacyPaths(): string[] {
  const index = loadLegacyIndex();
  if (!index) return [];
  return index.paths;
}

/**
 * Load the responsive image manifest.
 */
export function loadImageManifest(): ImageManifest {
  if (imageManifestCache) return imageManifestCache;

  const filePath = path.join(process.cwd(), 'content', 'legacy', 'image-manifest.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    imageManifestCache = JSON.parse(raw) as ImageManifest;
    return imageManifestCache;
  } catch {
    imageManifestCache = {};
    return imageManifestCache;
  }
}

/**
 * Try a path in the manifest, also attempting alternate file extensions
 * since the optimizer may have converted PNG to JPG or vice versa.
 */
function tryManifestLookup(manifest: ImageManifest, p: string): ImageManifestEntry | null {
  if (manifest[p]) return manifest[p];

  const ext = p.match(/\.(png|jpg|jpeg|gif)$/i)?.[1]?.toLowerCase();
  if (ext) {
    const base = p.replace(/\.(png|jpg|jpeg|gif)$/i, '');
    const alts = ext === 'png' ? ['.jpg', '.jpeg']
               : ext === 'jpg' || ext === 'jpeg' ? ['.png']
               : ext === 'gif' ? ['.png', '.jpg']
               : [];
    for (const alt of alts) {
      if (manifest[base + alt]) return manifest[base + alt];
    }
  }
  return null;
}

/**
 * Get responsive image data for an original image URL/path.
 * Tries multiple path normalizations since legacy pages reference
 * images with various prefixes (/2015/images/..., /images/..., /flag/..., etc.)
 */
export function getResponsiveImage(originalSrc: string): ImageManifestEntry | null {
  const manifest = loadImageManifest();

  // Direct lookup (with extension fallback)
  const direct = tryManifestLookup(manifest, originalSrc);
  if (direct) return direct;

  // Try decoded version
  const decoded = decodeURIComponent(originalSrc);
  if (decoded !== originalSrc) {
    const dec = tryManifestLookup(manifest, decoded);
    if (dec) return dec;
  }

  // Strip /2015 prefix: /2015/images/foo.png -> /images/foo.png
  const without2015 = originalSrc.replace(/^\/2015\//, '/');
  if (without2015 !== originalSrc) {
    const w = tryManifestLookup(manifest, without2015);
    if (w) return w;
  }

  // Add /images/ prefix if not present: /about_us/foo.png -> /images/about_us/foo.png
  if (!without2015.startsWith('/images/') && !without2015.startsWith('/flag/') && !without2015.startsWith('/event/')) {
    const withImages = '/images' + without2015;
    const wi = tryManifestLookup(manifest, withImages);
    if (wi) return wi;
  }

  // Strip /images/ entirely: /images/logo.png -> /logo.png
  const withoutImages = without2015.replace(/^\/images\//, '/');
  if (withoutImages !== without2015) {
    const woi = tryManifestLookup(manifest, withoutImages);
    if (woi) return woi;
  }

  return null;
}
