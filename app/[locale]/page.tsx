import { setRequestLocale } from "next-intl/server";
import { locales } from "@/lib/i18n";
import Hero from "@/components/sections/Hero";
import BentoGrid from "@/components/sections/BentoGrid";
import ContactPreview from "@/components/sections/ContactPreview";
import { generatePageMetadata } from "@/components/seo/MetaTags";
import homeData from "@/content/pages/home.json";
import type { Metadata } from "next";

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
    path: "",
  });
}

function getLocalizedText(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj["th"] || obj["en"] || "";
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { hero, contact_preview } = homeData.sections;

  const slides = hero.slides.map(
    (slide: {
      src: string;
      alt: string;
      caption?: Record<string, string>;
      href?: string;
    }) => ({
      src: slide.src,
      alt: slide.alt,
      title: slide.caption
        ? getLocalizedText(slide.caption, locale)
        : undefined,
      href: slide.href ? `/${locale}${slide.href}` : undefined,
    }),
  );

  return (
    <main>
      {/* Hero with image slider */}
      <Hero
        heading={getLocalizedText(hero.heading, locale)}
        subheading={getLocalizedText(hero.subheading, locale)}
        ctaText={getLocalizedText(hero.cta, locale)}
        ctaHref={`/${locale}/services`}
        slides={slides}
      />

      {/* New Bento Box Grid Layout matching legacy index_th.php topics */}
      <BentoGrid locale={locale} />

      {/* Contact Preview */}
      <ContactPreview
        heading={getLocalizedText(contact_preview.heading, locale)}
        companyName={contact_preview.companyName}
        address={getLocalizedText(contact_preview.address, locale)}
        phones={contact_preview.phones}
        email={contact_preview.email}
        ctaText={getLocalizedText(contact_preview.cta, locale)}
        ctaHref={`/${locale}/contact`}
      />
    </main>
  );
}
