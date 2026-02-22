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
}

export function generatePageMetadata({
  title,
  description,
  locale,
  path,
  ogImage = '/images/scraped/hero-banner.jpg',
}: GeneratePageMetadataOptions): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${SITE_URL}/${loc}${path}`;
  }

  return {
    title,
    description,
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
