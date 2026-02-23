import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SCRAPED_IMAGES_DIR = path.join(process.cwd(), 'scraped-data', 'images');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'legacy', 'images');
const MANIFEST_PATH = path.join(process.cwd(), 'content', 'legacy', 'image-manifest.json');

const WIDTHS = [320, 640, 768, 1024, 1280] as const;
const WEBP_QUALITY = 80;
const JPEG_QUALITY = 80;

interface ImageVariant {
  width: number;
  webp: string;
  fallback: string;
}

interface ImageManifestEntry {
  original: string;
  variants: ImageVariant[];
  srcset: string;
  fallbackSrc: string;
}

type ImageManifest = Record<string, ImageManifestEntry>;

function getAllImageFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllImageFiles(fullPath, baseDir));
    } else if (/\.(jpe?g|png|gif|webp|bmp|tiff?)$/i.test(entry.name)) {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

function getOutputPaths(relativePath: string) {
  const dir = path.dirname(relativePath);
  const ext = path.extname(relativePath);
  const name = path.basename(relativePath, ext);

  return WIDTHS.map((width) => {
    const webpPath = path.join(dir, `${name}-${width}w.webp`);
    const fallbackPath = path.join(dir, `${name}-${width}w${ext.toLowerCase() === '.png' ? '.png' : '.jpg'}`);
    return { width, webpPath, fallbackPath };
  });
}

/**
 * Register all possible URL aliases for a scraped image in the manifest.
 * Legacy pages reference images with various prefixes: /images/..., /2015/images/...,
 * /flag/..., /2015/icon/..., /event/..., etc.
 * relPath is the file's relative path under scraped-data/images/ (e.g., "images/logo.png", "flag/thai.png").
 */
function addManifestAliases(manifest: ImageManifest, relPath: string, entry: ImageManifestEntry): void {
  // Always add the direct path: /<relPath>
  manifest[`/${relPath}`] = entry;
  // With /2015/ prefix
  manifest[`/2015/${relPath}`] = entry;

  // If relPath starts with "images/", also add without "images/" prefix
  // e.g., "images/logo.png" -> /2015/images/logo.png (already covered above)
  // But the scraped-data/images/ dir has both "images/" subdir and other dirs like "event/", "flag/"
  // The key is to cover all possible URL patterns the old site used.

  // Also handle URL-encoded variants (e.g., spaces as %20)
  const encoded = relPath.split('/').map(s => encodeURIComponent(s)).join('/');
  if (encoded !== relPath) {
    manifest[`/${encoded}`] = entry;
    manifest[`/2015/${encoded}`] = entry;
  }
}

async function processImage(
  relativePath: string,
  manifest: ImageManifest,
  stats: { processed: number; skipped: number; errors: number },
): Promise<void> {
  const inputPath = path.join(SCRAPED_IMAGES_DIR, relativePath);
  const outputs = getOutputPaths(relativePath);

  // Check if already processed (largest WebP exists)
  const largestWebp = path.join(OUTPUT_DIR, outputs[outputs.length - 1].webpPath);
  if (fs.existsSync(largestWebp)) {
    // Still build manifest entry
    const variants: ImageVariant[] = outputs.map(({ width, webpPath, fallbackPath }) => ({
      width,
      webp: `/legacy/images/${webpPath.replace(/\\/g, '/')}`,
      fallback: `/legacy/images/${fallbackPath.replace(/\\/g, '/')}`,
    }));

    const srcset = variants.map((v) => `${v.webp} ${v.width}w`).join(', ');
    const fallbackSrc = variants[variants.length - 1].fallback;
    const relPath = relativePath.replace(/\\/g, '/');
    const entry: ImageManifestEntry = { original: `/${relPath}`, variants, srcset, fallbackSrc };

    addManifestAliases(manifest, relPath, entry);

    stats.skipped++;
    return;
  }

  try {
    const buffer = fs.readFileSync(inputPath);
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      stats.errors++;
      return;
    }

    const variants: ImageVariant[] = [];

    for (const { width, webpPath, fallbackPath } of outputs) {
      const targetWidth = Math.min(width, metadata.width);

      // WebP
      const webpFullPath = path.join(OUTPUT_DIR, webpPath);
      fs.mkdirSync(path.dirname(webpFullPath), { recursive: true });
      await sharp(buffer)
        .resize(targetWidth, undefined, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpFullPath);

      // Fallback (JPEG or PNG)
      const fallbackFullPath = path.join(OUTPUT_DIR, fallbackPath);
      fs.mkdirSync(path.dirname(fallbackFullPath), { recursive: true });
      const ext = path.extname(fallbackPath).toLowerCase();
      if (ext === '.png') {
        await sharp(buffer)
          .resize(targetWidth, undefined, { withoutEnlargement: true })
          .png({ quality: JPEG_QUALITY })
          .toFile(fallbackFullPath);
      } else {
        await sharp(buffer)
          .resize(targetWidth, undefined, { withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY })
          .toFile(fallbackFullPath);
      }

      variants.push({
        width,
        webp: `/legacy/images/${webpPath.replace(/\\/g, '/')}`,
        fallback: `/legacy/images/${fallbackPath.replace(/\\/g, '/')}`,
      });
    }

    const srcset = variants.map((v) => `${v.webp} ${v.width}w`).join(', ');
    const fallbackSrc = variants[variants.length - 1].fallback;
    const relPath = relativePath.replace(/\\/g, '/');
    const entry: ImageManifestEntry = { original: `/${relPath}`, variants, srcset, fallbackSrc };

    addManifestAliases(manifest, relPath, entry);

    stats.processed++;
  } catch (error) {
    process.stderr.write(`  Error processing ${relativePath}: ${(error as Error).message}\n`);
    stats.errors++;
  }
}

async function main(): Promise<void> {
  process.stderr.write('=== Responsive Image Optimizer ===\n');

  if (!fs.existsSync(SCRAPED_IMAGES_DIR)) {
    process.stderr.write(`Error: Scraped images directory not found: ${SCRAPED_IMAGES_DIR}\n`);
    process.stderr.write('Run "npm run scrape" first.\n');
    process.exit(1);
  }

  const imageFiles = getAllImageFiles(SCRAPED_IMAGES_DIR);
  process.stderr.write(`Found ${imageFiles.length} images to process\n`);
  process.stderr.write(`Output: ${OUTPUT_DIR}\n`);
  process.stderr.write(`Sizes: ${WIDTHS.join(', ')}w\n\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

  const manifest: ImageManifest = {};
  const stats = { processed: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const pct = Math.round(((i + 1) / imageFiles.length) * 100);
    process.stderr.write(`[${i + 1}/${imageFiles.length}] ${pct}% ${file}\n`);
    await processImage(file, manifest, stats);
  }

  // Save manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  process.stderr.write('\n=== Done ===\n');
  process.stderr.write(`  Processed: ${stats.processed}\n`);
  process.stderr.write(`  Skipped:   ${stats.skipped}\n`);
  process.stderr.write(`  Errors:    ${stats.errors}\n`);
  process.stderr.write(`  Manifest:  ${MANIFEST_PATH}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${(err as Error).message}\n`);
  process.exit(1);
});
