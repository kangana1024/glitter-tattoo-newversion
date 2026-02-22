import * as fs from 'fs';
import * as path from 'path';
import { crawlSite, CrawlResult } from './lib/crawler';
import { downloadToFile } from './lib/downloader';
import { createLogger, Logger } from './lib/logger';

const BASE_URL = 'https://www.glitter-tattoo.com';

interface CliOptions {
  help: boolean;
  output: string;
  delay: number;
  maxPages?: number;
  verbose: boolean;
}

function printHelp(): void {
  process.stderr.write(`
Usage: npx tsx scripts/scrape.ts [options]

Crawl and download the entire glitter-tattoo.com website — all HTML pages
and all images — saving them into a structured local output directory.

Options:
  --help          Show this help message
  --output <dir>  Output directory (default: ./scraped-data)
  --delay <ms>    Delay between requests in milliseconds (default: 300)
  --max-pages <n> Maximum pages to crawl (useful for testing)
  --verbose       Enable detailed per-URL logging

Examples:
  npx tsx scripts/scrape.ts
  npx tsx scripts/scrape.ts --max-pages 10 --verbose
  npx tsx scripts/scrape.ts --output ./my-data --delay 500
`);
}

function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const options: CliOptions = {
    help: false,
    output: './scraped-data',
    delay: 300,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--output':
        options.output = args[++i] || './scraped-data';
        break;
      case '--delay':
        options.delay = parseInt(args[++i], 10) || 300;
        break;
      case '--max-pages':
        options.maxPages = parseInt(args[++i], 10) || undefined;
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }

  return options;
}

/**
 * Convert an image URL to a local file path under the images/ directory.
 */
function imageUrlToLocalPath(url: string): string {
  try {
    const parsed = new URL(url);
    let pathname = parsed.pathname.replace(/^\//, '');
    if (!pathname) pathname = 'unknown';
    return `images/${pathname}`;
  } catch {
    return `images/${url.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  }
}

interface ManifestEntry {
  url: string;
  file: string;
}

interface ManifestError {
  url: string;
  error: string;
}

interface Manifest {
  scraped_at: string;
  base_url: string;
  pages_count: number;
  images_count: number;
  errors_count: number;
  pages: ManifestEntry[];
  images: ManifestEntry[];
  errors: ManifestError[];
}

async function downloadImages(
  imageUrls: Set<string>,
  outputDir: string,
  logger: Logger,
  options: CliOptions,
): Promise<{ downloaded: ManifestEntry[]; errors: ManifestError[] }> {
  const downloaded: ManifestEntry[] = [];
  const errors: ManifestError[] = [];
  const total = imageUrls.size;
  let count = 0;

  for (const url of imageUrls) {
    count++;
    const localPath = imageUrlToLocalPath(url);
    const fullPath = path.join(outputDir, localPath);

    logger.progress(count, total, `Downloading image: ${url}`);

    try {
      await downloadToFile(url, fullPath, {
        rateLimitMs: options.delay,
        verbose: options.verbose,
      });
      downloaded.push({ url, file: localPath });
    } catch (error) {
      const errMsg = (error as Error).message;
      logger.error(`Failed to download image ${url}: ${errMsg}`);
      errors.push({ url, error: errMsg });
    }
  }

  return { downloaded, errors };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const logger = createLogger(options.verbose);
  const outputDir = path.resolve(options.output);
  const pagesDir = path.join(outputDir, 'pages');
  const imagesDir = path.join(outputDir, 'images');

  // Create output directories
  fs.mkdirSync(pagesDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  logger.info(`=== Glitter Tattoo Full-Site Scraper ===`);
  logger.info(`Output: ${outputDir}`);
  logger.info(`Delay: ${options.delay}ms`);
  if (options.maxPages !== undefined) {
    logger.info(`Max pages: ${options.maxPages}`);
  }

  // Step 1: Crawl site to discover pages and collect image URLs
  logger.info('Step 1: Crawling site to discover pages...');
  const crawlResult: CrawlResult = await crawlSite(
    {
      startUrl: BASE_URL,
      delayMs: options.delay,
      maxPages: options.maxPages,
      verbose: options.verbose,
    },
    logger,
  );

  // Step 2: Save HTML pages to disk
  logger.info(`Step 2: Saving ${crawlResult.pages.length} HTML pages...`);
  const pageEntries: ManifestEntry[] = [];

  for (const page of crawlResult.pages) {
    const fullPath = path.join(outputDir, page.localPath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, page.html, 'utf-8');
    pageEntries.push({ url: page.url, file: page.localPath });
    logger.verbose(`Saved: ${page.localPath}`);
  }

  // Step 3: Download images
  logger.info(`Step 3: Downloading ${crawlResult.imageUrls.size} images...`);
  const imageResult = await downloadImages(
    crawlResult.imageUrls,
    outputDir,
    logger,
    options,
  );

  // Combine errors from crawl and image downloads
  const allErrors: ManifestError[] = [
    ...crawlResult.errors.map((e) => ({ url: e.url, error: e.error })),
    ...imageResult.errors,
  ];

  // Step 4: Generate manifest.json
  const manifest: Manifest = {
    scraped_at: new Date().toISOString(),
    base_url: BASE_URL,
    pages_count: pageEntries.length,
    images_count: imageResult.downloaded.length,
    errors_count: allErrors.length,
    pages: pageEntries,
    images: imageResult.downloaded,
    errors: allErrors,
  };

  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  logger.success(`Manifest saved: ${path.join(outputDir, 'manifest.json')}`);

  // Step 5: Write errors.log if there are any errors
  if (allErrors.length > 0) {
    const errorLog = allErrors
      .map((e) => `${e.url} — ${e.error}`)
      .join('\n');
    fs.writeFileSync(path.join(outputDir, 'errors.log'), errorLog + '\n');
    logger.warn(`${allErrors.length} errors logged to errors.log`);
  }

  // Summary
  logger.info('');
  logger.success('=== Scraping Complete ===');
  logger.info(`  Pages:  ${manifest.pages_count}`);
  logger.info(`  Images: ${manifest.images_count}`);
  logger.info(`  Errors: ${manifest.errors_count}`);
  logger.info(`  Output: ${outputDir}`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${(err as Error).message}\n`);
  process.exit(1);
});
