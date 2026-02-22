import { scrapeAllPages, saveScrapedContent, collectAllImageUrls } from './scrape-content';
import { downloadImages } from './scrape-images';

async function main(): Promise<void> {
  process.stderr.write('=== Glitter Tattoo Content Scraper ===\n\n');

  // Step 1: Scrape content
  process.stderr.write('Step 1: Scraping page content...\n');
  const results = await scrapeAllPages();
  await saveScrapedContent(results);
  process.stderr.write(`  Scraped ${results.size} pages\n\n`);

  // Step 2: Download and optimize images
  process.stderr.write('Step 2: Downloading and optimizing images...\n');
  const imageUrls = collectAllImageUrls(results);
  process.stderr.write(`  Found ${imageUrls.length} unique images\n`);
  const imageMap = await downloadImages(imageUrls);
  process.stderr.write(`  Downloaded ${imageMap.size} images\n\n`);

  process.stderr.write('=== Scraping complete ===\n');
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
