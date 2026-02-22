import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import { generatePageMetadata } from '@/components/seo/MetaTags';
import servicesData from '@/content/pages/services.json';
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
  const heading = getLocalizedText(servicesData.sections.heading, locale);

  return generatePageMetadata({
    title: heading,
    description: servicesData.description,
    locale,
    path: '/services',
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const heading = getLocalizedText(servicesData.sections.heading, locale);
  const intro = getLocalizedText(servicesData.sections.intro, locale);
  const pricingNote = getLocalizedText(servicesData.sections.pricing_note, locale);
  const services = servicesData.sections.services;

  return (
    <article className="py-16 sm:py-20 lg:py-24">
      <Container>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-4">
          {heading}
        </h1>
        <p className="font-body text-base sm:text-lg text-text-secondary text-center mb-12 max-w-2xl mx-auto">
          {intro}
        </p>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service) => (
            <div key={service.id} className="flex flex-col">
              <Card
                title={getLocalizedText(service.title, locale)}
                description={getLocalizedText(service.description, locale)}
                image={service.image}
                imageAlt={getLocalizedText(service.title, locale)}
              />
              {service.features && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="font-body text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Pricing note */}
        <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-xl p-6 text-center">
          <p className="font-body text-base text-text-primary">
            {pricingNote}
          </p>
        </div>
      </Container>
    </article>
  );
}
