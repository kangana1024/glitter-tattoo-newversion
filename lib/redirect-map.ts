/**
 * Mapping of old (legacy) URL paths to new URL paths.
 * Used by the catch-all route app/[locale]/[...rest]/page.tsx
 * to redirect visitors from old URLs to the correct new pages.
 *
 * Keys are old paths (without locale prefix).
 * Values are new paths (without locale prefix).
 */
export const redirectMap: Record<string, string> = {
  // Homepage variants
  '/home_en.html': '/',
  '/home_ch.html': '/',
  '/home.html': '/',

  // About page variants
  '/2015/about.html': '/about',
  '/2015/about_en.html': '/about',
  '/2015/about_ch.html': '/about',
  '/about.html': '/about',

  // Products/Services page variants
  '/2015/products.html': '/services',
  '/2015/products_en.html': '/services',
  '/2015/products_ch.html': '/services',
  '/products.html': '/services',
  '/products': '/services',

  // Gallery page variants
  '/2015/gallery.html': '/gallery',
  '/2015/gallery_en.html': '/gallery',
  '/2015/gallery_ch.html': '/gallery',
  '/gallery.html': '/gallery',

  // Contact page variants
  '/2015/contact.html': '/contact',
  '/2015/contact_en.html': '/contact',
  '/2015/contact_ch.html': '/contact',
  '/contact.html': '/contact',

  // /2015 and /2015/index.html - keep only /2015 to avoid static export path conflict
  '/2015': '/',
};
