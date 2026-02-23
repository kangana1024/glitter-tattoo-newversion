import type { Metadata } from 'next';
import { locales } from '@/lib/i18n';

const SITE_URL = 'https://www.glitter-tattoo.com';
const SITE_NAME = 'Glitter Tattoo';

interface GeneratePageMetadataOptions {
  title: string;
  description: string;
  locale: string;
  path: string; // e.g. '/about' or '' for home
  ogImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noindex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  locale,
  path,
  ogImage = '/legacy/images/images_newproduct/happy_family_2012_3-1280w.png',
  keywords,
  canonicalUrl,
  noindex,
}: GeneratePageMetadataOptions): Metadata {
  const url = canonicalUrl || `${SITE_URL}/${locale}${path}`;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${SITE_URL}/${loc}${path}`;
  }

  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages,
    },
  };
}
