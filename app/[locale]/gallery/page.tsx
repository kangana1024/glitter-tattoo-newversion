import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n';
import GalleryGrid from '@/components/sections/GalleryGrid';
import { generatePageMetadata } from '@/components/seo/MetaTags';
import galleryData from '@/content/pages/gallery.json';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function getLocalizedText(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj['th'] || obj['en'] || '';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const heading = getLocalizedText(galleryData.sections.heading, locale);

  return generatePageMetadata({
    title: heading,
    description: galleryData.description,
    locale,
    path: '/gallery',
  });
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const heading = getLocalizedText(galleryData.sections.heading, locale);
  const intro = getLocalizedText(galleryData.sections.intro, locale);
  const categories = galleryData.sections.categories.map((cat) => ({
    id: cat.id,
    title: getLocalizedText(cat.title, locale),
  }));

  return (
    <GalleryGrid
      heading={heading}
      intro={intro}
      categories={categories}
      items={galleryData.sections.items}
    />
  );
}
