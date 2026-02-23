import Container from "@/components/ui/Container";
import ResponsiveImage from "./ResponsiveImage";
import type { LegacyPageContent } from "@/lib/legacy-content";
import { getResponsiveImage } from "@/lib/legacy-content";

interface LegacyPageProps {
  content: LegacyPageContent;
  images: Array<{ src: string; alt: string }>;
}

export default function LegacyPage({ content, images }: LegacyPageProps) {
  const processedBodyHtml = content.bodyHtml
    ? rewriteInlineImages(cleanLegacyHtml(sanitizeHtml(content.bodyHtml)))
    : "";

  // Filter to only images that actually resolve in the manifest
  // This ensures no broken images appear in the gallery
  const contentImages = images.filter((img) => {
    const src = img.src.toLowerCase();
    // Skip common UI/nav images
    if (src.includes("/flag/")) return false;
    if (src.includes("/icon/")) return false;
    if (src.includes("/anitmation/") || src.includes("/animation/"))
      return false;
    if (src.endsWith(".gif")) return false;
    if (src.includes("hothot") || src.includes("coolcool")) return false;
    if (src.includes("logo.png")) return false;
    // Only show images that have responsive versions available
    return getResponsiveImage(img.src) !== null;
  });

  return (
    <Container as="article" className="py-8 sm:py-12">
      {/* Page Title */}
      {content.title && (
        <h1 className="mb-8 text-2xl font-bold text-text-primary sm:text-3xl lg:text-4xl font-heading">
          {content.title}
        </h1>
      )}

      {/* Images gallery */}
      {contentImages.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {contentImages.slice(0, 12).map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-surface shadow-sm"
            >
              <ResponsiveImage
                src={img.src}
                alt={img.alt || content.title || ""}
                className="h-auto w-full object-cover"
                loading={i < 4 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      )}

      {/* Body content */}
      {processedBodyHtml ? (
        <div
          className="legacy-content prose prose-sm sm:prose-base max-w-none text-text-primary prose-headings:font-heading prose-headings:text-text-primary prose-a:text-primary prose-img:rounded-lg prose-img:max-w-full"
          dangerouslySetInnerHTML={{ __html: processedBodyHtml }}
        />
      ) : content.bodyText ? (
        <div className="text-text-secondary leading-relaxed whitespace-pre-line">
          {content.bodyText}
        </div>
      ) : null}

      {/* More images if there are many */}
      {contentImages.length > 12 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {contentImages.slice(12).map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-surface shadow-sm"
            >
              <ResponsiveImage
                src={img.src}
                alt={img.alt || content.title || ""}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

/**
 * Basic HTML sanitization - remove scripts, event handlers, and dangerous elements.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/<(iframe|embed|object)\b[^>]*>.*?<\/\1>/gi, "")
    .replace(/<(iframe|embed|object)\b[^>]*\/?>/gi, "")
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
}

/**
 * Clean up legacy HTML structure - remove old CSS classes, fix layout issues,
 * strip sticklr social widgets and other non-content elements.
 */
function cleanLegacyHtml(html: string): string {
  return (
    html
      // Remove sticklr social media widget lists and orphaned list items around them
      .replace(/<ul\b[^>]*\bsticklr\b[\s\S]*$/gi, "")
      // Remove Cloudflare email protection spans
      .replace(/<a[^>]*class="__cf_email__"[^>]*>[^<]*<\/a>/gi, "")
      .replace(/\[email[^\]]*\]/gi, "info@glitter-tattoo.com")
      // Remove empty divs with legacy classes
      .replace(
        /<div\b[^>]*class="(clear|delimiter|padding\d*|cbottom|ctop)"[^>]*><\/div>/gi,
        "",
      )
      .replace(/<div\b[^>]*class="clear padding\d*"[^>]*><\/div>/gi, "")
      // Remove old column layout classes and convert to flow
      .replace(
        /class="col_\d+_\d+[^"]*"/gi,
        'class="inline-block align-top mr-4 mb-4"',
      )
      // Remove inline styles that break layout (but keep text-align)
      .replace(/style="[^"]*"/gi, (match) => {
        const textAlign = match.match(/text-align:\s*[^;"]+/i);
        if (textAlign) return `style="${textAlign[0]}"`;
        return "";
      })
      // Remove homepage_widgets_bg sections
      .replace(
        /<section\b[^>]*class="homepage_widgets_bg[^"]*"[^>]*>[\s\S]*?<\/section>/gi,
        "",
      )
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Clean up multiple consecutive whitespace/newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

const INLINE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 1280px";

/**
 * Rewrite <img> tags in body HTML to use <picture> with responsive WebP srcset
 * when a matching image exists in the manifest. Falls back to rewritten src path.
 */
function rewriteInlineImages(html: string): string {
  return html.replace(
    /<img\b([^>]*?)src=["']([^"']+)["']([^>]*?)\/?>/gi,
    (_match, before: string, src: string, after: string) => {
      const normalizedSrc = normalizeLegacySrc(src);
      const imageData = getResponsiveImage(normalizedSrc);

      if (imageData) {
        const altMatch = (before + after).match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : "";
        const cleanAttrs = (before + after)
          .replace(/alt=["'][^"']*["']/i, "")
          .replace(/src=["'][^"']*["']/i, "")
          .replace(/style="[^"]*"/gi, "")
          .trim();

        return `<picture><source type="image/webp" srcset="${imageData.srcset}" sizes="${INLINE_SIZES}" /><img src="${imageData.fallbackSrc}" alt="${alt}" ${cleanAttrs} loading="lazy" decoding="async" style="max-width:100%;height:auto" /></picture>`;
      }

      // No responsive version found - remove the broken image tag entirely
      // since it would show as a broken image icon
      return "";
    },
  );
}

/**
 * Normalize a legacy image src to an absolute path.
 * Tries multiple patterns since legacy pages use relative paths.
 */
function normalizeLegacySrc(src: string): string {
  if (src.startsWith("/") || src.startsWith("http")) return src;
  // Relative path like "images/about_us/about_us.png" -> "/images/about_us/about_us.png"
  return `/${src}`;
}
