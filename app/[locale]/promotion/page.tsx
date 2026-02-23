import { setRequestLocale } from "next-intl/server";
import { locales } from "@/lib/i18n";
import Hero from "@/components/sections/Hero";
import Container from "@/components/ui/Container";
import Image from "next/image";
import promotionData from "@/content/pages/promotion.json";
import { generatePageMetadata } from "@/components/seo/MetaTags";

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
  return generatePageMetadata({
    title: promotionData.title,
    description: promotionData.description,
    locale,
    path: `/${locale}/promotion`,
  });
}

function getLocalizedText(obj: any, locale: string) {
  return obj[locale] || obj["en"]; // Fallback to English if translation is missing
}

export default async function PromotionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const hero = promotionData.hero;
  const content = promotionData.content;

  return (
    <main className="min-h-screen bg-bg-light">
      <Hero
        heading={getLocalizedText(hero.heading, locale)}
        subheading={getLocalizedText(hero.subheading, locale)}
        ctaText={getLocalizedText(hero.heading, locale)}
        ctaHref={`/${locale}/services`}
        slides={[{ src: hero.image, alt: "Promotion Hero" }]}
      />

      <section className="py-16 bg-surface">
        <Container>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-text-primary mb-4">
              {getLocalizedText(content.heading, locale)}
            </h2>
          </div>

          <div className="flex flex-col gap-12 max-w-4xl mx-auto">
            {content.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-bg-light rounded-xl overflow-hidden shadow-default hover:shadow-hover transition-shadow duration-300"
              >
                <div className="relative h-64 sm:h-80 md:h-[400px] w-full">
                  <Image
                    src={item.image}
                    alt={getLocalizedText(item.title, locale)}
                    fill
                    className="object-contain bg-white p-4"
                  />
                </div>
                <div className="p-8 text-center bg-primary-light/10">
                  <h3 className="font-heading text-2xl text-primary-dark mb-4 drop-shadow-sm">
                    {getLocalizedText(item.title, locale)}
                  </h3>
                  <p className="text-lg text-text-secondary">
                    {getLocalizedText(item.description, locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
