import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const RATE_LIMIT_MS = 500;
const MAX_RETRIES = 3;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'scraped');
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadWithRetry(url: string): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
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

function sanitizeFilename(url: string): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const basename = path.basename(pathname) || 'image';
  // Remove query params and sanitize
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function optimizeImage(buffer: Buffer, filename: string): Promise<Buffer> {
  const ext = path.extname(filename).toLowerCase();

  try {
    let pipeline = sharp(buffer);
    const metadata = await pipeline.metadata();

    // Resize if too large
    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
    }

    // Convert to appropriate format
    if (ext === '.png') {
      return await pipeline.png({ quality: JPEG_QUALITY }).toBuffer();
    } else if (ext === '.webp') {
      return await pipeline.webp({ quality: JPEG_QUALITY }).toBuffer();
    } else {
      // Default to JPEG
      return await pipeline.jpeg({ quality: JPEG_QUALITY }).toBuffer();
    }
  } catch {
    // If sharp fails, return original buffer
    process.stderr.write(`  Warning: Could not optimize ${filename}, saving original\n`);
    return buffer;
  }
}

export async function downloadImages(imageUrls: string[]): Promise<Map<string, string>> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const downloaded = new Map<string, string>();
  const seen = new Set<string>();

  for (const url of imageUrls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const filename = sanitizeFilename(url);
    const outputPath = path.join(OUTPUT_DIR, filename);

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
      downloaded.set(url, `/images/scraped/${filename}`);
      continue;
    }

    process.stderr.write(`Downloading: ${url}\n`);

    try {
      const buffer = await downloadWithRetry(url);
      const optimized = await optimizeImage(buffer, filename);
      fs.writeFileSync(outputPath, optimized);
      downloaded.set(url, `/images/scraped/${filename}`);
      process.stderr.write(`  Saved: ${filename} (${(optimized.length / 1024).toFixed(1)}KB)\n`);
      await delay(RATE_LIMIT_MS);
    } catch (error) {
      process.stderr.write(`  Failed to download ${url}: ${(error as Error).message}\n`);
    }
  }

  return downloaded;
}

export async function downloadImagesFromScrapedContent(): Promise<Map<string, string>> {
  const scrapedDir = path.join(process.cwd(), 'content', 'scraped');

  if (!fs.existsSync(scrapedDir)) {
    process.stderr.write('No scraped content found. Run scrape-content.ts first.\n');
    return new Map();
  }

  const allUrls: string[] = [];
  const files = fs.readdirSync(scrapedDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(scrapedDir, file), 'utf-8'));
      const pages = Array.isArray(data) ? data : [data];
      for (const page of pages) {
        if (page.images) {
          for (const img of page.images) {
            if (img.src) allUrls.push(img.src);
          }
        }
      }
    } catch {
      process.stderr.write(`  Warning: Could not parse ${file}\n`);
    }
  }

  const unique = [...new Set(allUrls)];
  process.stderr.write(`Found ${unique.length} unique image URLs\n`);

  return downloadImages(unique);
}

// Run directly
if (require.main === module || process.argv[1]?.endsWith('scrape-images.ts')) {
  (async () => {
    process.stderr.write('Starting image download...\n');
    const results = await downloadImagesFromScrapedContent();
    process.stderr.write(`Done. Downloaded ${results.size} images.\n`);

    // Save image mapping for reference
    const mappingPath = path.join(process.cwd(), 'content', 'scraped', 'image-map.json');
    fs.writeFileSync(
      mappingPath,
      JSON.stringify(Object.fromEntries(results), null, 2)
    );
    process.stderr.write(`Image mapping saved to content/scraped/image-map.json\n`);
  })().catch((err) => {
    process.stderr.write(`Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}
