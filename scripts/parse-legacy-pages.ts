import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const SCRAPED_PAGES_DIR = path.join(process.cwd(), 'scraped-data', 'pages');
const MANIFEST_PATH = path.join(process.cwd(), 'scraped-data', 'manifest.json');
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'legacy');
const GROUPS_DIR = path.join(OUTPUT_DIR, 'groups');

interface ParsedPage {
  /** Original URL path (e.g., /about_us_en.html) */
  urlPath: string;
  /** Local file path relative to scraped-data/pages/ */
  filePath: string;
  /** Detected locale: en, th, zh */
  locale: string;
  /** Page group name (e.g., about_us, product_professional) */
  groupName: string;
  /** Extracted title */
  title: string;
  /** Extracted meta description */
  description: string;
  /** Extracted meta keywords */
  keywords: string;
  /** H1-H3 headings */
  headings: string[];
  /** Body text (cleaned) */
  bodyText: string;
  /** Body HTML (main content area) */
  bodyHtml: string;
  /** Images found on the page */
  images: Array<{ src: string; alt: string }>;
}

interface PageGroup {
  groupName: string;
  /** All URL paths that belong to this group */
  urlPaths: string[];
  /** Content per locale */
  locales: Record<string, ParsedPage>;
  /** Canonical path for this group (the "best" URL) */
  canonicalPath: string;
  /** Combined SEO keywords */
  keywords: string[];
  /** Combined unique images */
  images: Array<{ src: string; alt: string }>;
}

interface LegacyPagesIndex {
  generatedAt: string;
  totalPages: number;
  totalGroups: number;
  /** Map from URL path → group name */
  pathToGroup: Record<string, string>;
  /** All group names */
  groups: string[];
  /** All URL paths */
  paths: string[];
}

/**
 * Detect locale from filename/path patterns.
 */
function detectLocale(filePath: string): string {
  const lower = filePath.toLowerCase();

  // Explicit locale patterns
  if (/_en\.html?$/i.test(lower) || /_eng\.html?$/i.test(lower)) return 'en';
  if (/_ch\.html?$/i.test(lower) || /_cn\.html?$/i.test(lower)) return 'zh';
  if (/_th\.html?$/i.test(lower)) return 'th';

  // Directory-based
  if (/^eng\//i.test(lower) || /\/eng\//i.test(lower)) return 'en';
  if (/^ch\//i.test(lower) || /\/ch\//i.test(lower)) return 'zh';

  // PHP files with th. prefix
  if (/\/th\./i.test(lower)) return 'th';

  // home_eng, home_ch patterns
  if (/home_eng/i.test(lower)) return 'en';
  if (/home_ch/i.test(lower)) return 'zh';

  // Contact, about patterns
  if (/contact_us_en/i.test(lower) || /about_us_en/i.test(lower)) return 'en';

  // Default to Thai
  return 'th';
}

/**
 * Extract a group name from a file path.
 * Groups locale variants together.
 */
function extractGroupName(filePath: string): string {
  let name = filePath;

  // Remove directory prefixes
  name = name.replace(/^(2015|eng|ch|event|event_new|gallery)\//i, '');

  // Remove file extension
  name = name.replace(/\.(html?|php)$/i, '');

  // Remove locale suffixes
  name = name.replace(/_(en|eng|th|ch|cn)$/i, '');
  name = name.replace(/_en_v\d+$/i, '');

  // Remove th. prefix from PHP files
  name = name.replace(/^th\./i, '');

  // Clean up
  name = name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  if (!name || name === 'index') {
    // Determine group from parent dir
    const dir = path.dirname(filePath);
    if (dir === '.' || dir === '') return 'home';
    return dir.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  // Add parent dir prefix for disambiguation
  const dir = path.dirname(filePath);
  if (dir !== '.' && dir !== '' && !['2015'].includes(dir)) {
    return `${dir.replace(/[^a-zA-Z0-9_-]/g, '_')}_${name}`;
  }

  return name;
}

/**
 * Parse an HTML file and extract structured content.
 */
function parsePage(html: string, filePath: string, urlPath: string): ParsedPage {
  const $ = cheerio.load(html);
  const locale = detectLocale(filePath);
  const groupName = extractGroupName(filePath);

  // Extract title
  const title = $('title').text().trim() || '';

  // Extract meta description
  const description = $('meta[name="description"]').attr('content')?.trim() || '';

  // Extract meta keywords
  const keywords = $('meta[name="keywords"]').attr('content')?.trim() || '';

  // Extract headings
  const headings: string[] = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push(text);
  });

  // Extract main content area
  // Try common content selectors
  let $content = $('main, #content, .content, #main, .main, article');
  if ($content.length === 0) {
    $content = $('body');
  }

  // Remove nav, header, footer, scripts, styles from content
  const $clone = $content.clone();
  $clone.find('nav, header, footer, script, style, noscript, .menu, .navigation, #menu, #navigation').remove();

  const bodyHtml = $clone.html()?.trim() || '';
  const bodyText = $clone.text().replace(/\s+/g, ' ').trim();

  // Extract images
  const images: Array<{ src: string; alt: string }> = [];
  const seenSrc = new Set<string>();
  $('img').each((_, el) => {
    let src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';

    if (!src || src.startsWith('data:')) return;

    // Resolve relative URLs to paths
    if (!src.startsWith('http') && !src.startsWith('/')) {
      const pageDir = path.dirname(urlPath);
      src = path.posix.join(pageDir, src);
    }
    if (src.startsWith('http')) {
      try {
        src = new URL(src).pathname;
      } catch {
        return;
      }
    }

    if (!seenSrc.has(src)) {
      seenSrc.add(src);
      images.push({ src, alt });
    }
  });

  return {
    urlPath,
    filePath,
    locale,
    groupName,
    title,
    description,
    keywords,
    headings,
    bodyText,
    bodyHtml,
    images,
  };
}

/**
 * Get all HTML/PHP files recursively from a directory.
 */
function getAllPageFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip images directories
      if (entry.name === 'images' || entry.name === 'images2Slide') continue;
      files.push(...getAllPageFiles(fullPath, baseDir));
    } else if (/\.(html?|php)$/i.test(entry.name)) {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

/**
 * Choose the canonical path for a group.
 * Prefer: Thai root > 2015 dir > others
 */
function chooseCanonicalPath(pages: ParsedPage[]): string {
  // Prefer the shortest Thai path
  const thPages = pages.filter((p) => p.locale === 'th');
  if (thPages.length > 0) {
    thPages.sort((a, b) => a.urlPath.length - b.urlPath.length);
    return thPages[0].urlPath;
  }
  // Fallback to shortest path
  const sorted = [...pages].sort((a, b) => a.urlPath.length - b.urlPath.length);
  return sorted[0].urlPath;
}

async function main(): Promise<void> {
  process.stderr.write('=== Legacy Page Parser ===\n');

  if (!fs.existsSync(SCRAPED_PAGES_DIR)) {
    process.stderr.write(`Error: Scraped pages directory not found: ${SCRAPED_PAGES_DIR}\n`);
    process.stderr.write('Run "npm run scrape" first.\n');
    process.exit(1);
  }

  // Get all page files
  const pageFiles = getAllPageFiles(SCRAPED_PAGES_DIR);
  process.stderr.write(`Found ${pageFiles.length} page files\n`);

  // Also load manifest for URL mapping
  let manifestPages: Array<{ url: string; file: string }> = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    manifestPages = manifest.pages || [];
  }

  // Create URL path mapping from manifest
  const fileToUrl = new Map<string, string>();
  for (const entry of manifestPages) {
    const relPath = entry.file.replace(/^pages\//, '');
    try {
      const urlPath = new URL(entry.url).pathname;
      fileToUrl.set(relPath, urlPath);
    } catch {
      // skip
    }
  }

  // Parse all pages
  const parsedPages: ParsedPage[] = [];

  for (let i = 0; i < pageFiles.length; i++) {
    const file = pageFiles[i];
    const pct = Math.round(((i + 1) / pageFiles.length) * 100);
    process.stderr.write(`[${i + 1}/${pageFiles.length}] ${pct}% ${file}\n`);

    const fullPath = path.join(SCRAPED_PAGES_DIR, file);
    const html = fs.readFileSync(fullPath, 'utf-8');

    // Get URL path from manifest or construct from file path
    const urlPath = fileToUrl.get(file) || `/${file}`;

    const parsed = parsePage(html, file, urlPath);

    // Skip pages with very little content
    if (parsed.bodyText.length < 20 && parsed.headings.length === 0) {
      process.stderr.write(`  Skipped (no content): ${file}\n`);
      continue;
    }

    parsedPages.push(parsed);
  }

  process.stderr.write(`\nParsed ${parsedPages.length} pages with content\n`);

  // Group pages by group name
  const groupsMap = new Map<string, ParsedPage[]>();
  for (const page of parsedPages) {
    const existing = groupsMap.get(page.groupName) || [];
    existing.push(page);
    groupsMap.set(page.groupName, existing);
  }

  process.stderr.write(`Found ${groupsMap.size} page groups\n`);

  // Create output directories
  fs.mkdirSync(GROUPS_DIR, { recursive: true });

  // Build groups and save
  const pathToGroup: Record<string, string> = {};
  const allPaths: string[] = [];
  const groupNames: string[] = [];

  for (const [groupName, pages] of groupsMap) {
    const canonicalPath = chooseCanonicalPath(pages);
    const locales: Record<string, ParsedPage> = {};
    const allKeywords: string[] = [];
    const allImages: Array<{ src: string; alt: string }> = [];
    const seenImages = new Set<string>();

    for (const page of pages) {
      locales[page.locale] = page;

      // Map all URL paths to this group
      pathToGroup[page.urlPath] = groupName;
      allPaths.push(page.urlPath);

      // Collect keywords
      if (page.keywords) {
        allKeywords.push(...page.keywords.split(',').map((k) => k.trim()).filter(Boolean));
      }

      // Collect images
      for (const img of page.images) {
        if (!seenImages.has(img.src)) {
          seenImages.add(img.src);
          allImages.push(img);
        }
      }
    }

    const group: PageGroup = {
      groupName,
      urlPaths: pages.map((p) => p.urlPath),
      locales,
      canonicalPath,
      keywords: [...new Set(allKeywords)],
      images: allImages,
    };

    // Save group JSON
    const groupFile = path.join(GROUPS_DIR, `${groupName}.json`);
    fs.writeFileSync(groupFile, JSON.stringify(group, null, 2));
    groupNames.push(groupName);
  }

  // Save index
  const index: LegacyPagesIndex = {
    generatedAt: new Date().toISOString(),
    totalPages: parsedPages.length,
    totalGroups: groupsMap.size,
    pathToGroup,
    groups: groupNames.sort(),
    paths: allPaths.sort(),
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'pages.json'), JSON.stringify(index, null, 2));

  process.stderr.write('\n=== Done ===\n');
  process.stderr.write(`  Pages parsed: ${parsedPages.length}\n`);
  process.stderr.write(`  Groups:       ${groupsMap.size}\n`);
  process.stderr.write(`  Index:        ${path.join(OUTPUT_DIR, 'pages.json')}\n`);
  process.stderr.write(`  Groups dir:   ${GROUPS_DIR}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${(err as Error).message}\n`);
  process.exit(1);
});
