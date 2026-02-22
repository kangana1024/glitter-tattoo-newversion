import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n';
import Hero from '@/components/sections/Hero';
import ServiceGrid from '@/components/sections/ServiceGrid';
import { generatePageMetadata } from '@/components/seo/MetaTags';
import homeData from '@/content/pages/home.json';
import servicesData from '@/content/pages/services.json';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const heading = getLocalizedText(homeData.sections.hero.heading, locale);

  return generatePageMetadata({
    title: heading,
    description: homeData.description,
    locale,
    path: '',
  });
}

function getLocalizedText(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj['th'] || obj['en'] || '';
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const hero = homeData.sections.hero;
  const services = servicesData.sections.services.map((s) => ({
    id: s.id,
    title: getLocalizedText(s.title, locale),
    description: getLocalizedText(s.description, locale),
    image: s.image,
  }));

  return (
    <main>
      <Hero
        heading={getLocalizedText(hero.heading, locale)}
        subheading={getLocalizedText(hero.subheading, locale)}
        ctaText={getLocalizedText(hero.cta, locale)}
        ctaHref={`/${locale}/services`}
      />
      <ServiceGrid
        heading={getLocalizedText(servicesData.sections.heading, locale)}
        services={services}
        locale={locale}
      />
    </main>
  );
}
