import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n';
import Container from '@/components/ui/Container';
import aboutData from '@/content/pages/about.json';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function getLocalizedText(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj['th'] || obj['en'] || '';
}

function getLocalizedArray(obj: Record<string, string[]>, locale: string): string[] {
  return obj[locale] || obj['th'] || obj['en'] || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const heading = getLocalizedText(aboutData.sections.heading, locale);

  return {
    title: heading,
    description: aboutData.description,
    openGraph: {
      title: heading,
      description: aboutData.description,
      url: `https://www.glitter-tattoo.com/${locale}/about`,
    },
    alternates: {
      canonical: `https://www.glitter-tattoo.com/${locale}/about`,
      languages: { en: '/en/about', th: '/th/about', zh: '/zh/about' },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const heading = getLocalizedText(aboutData.sections.heading, locale);
  const storyHeading = getLocalizedText(aboutData.sections.story.heading, locale);
  const paragraphs = getLocalizedArray(aboutData.sections.story.paragraphs, locale);
  const values = aboutData.sections.values;

  return (
    <article className="py-16 sm:py-20 lg:py-24">
      <Container>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-12">
          {heading}
        </h1>

        {/* Our Story */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-6">
            {storyHeading}
          </h2>
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-body text-base sm:text-lg text-text-secondary leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-surface rounded-xl shadow-md p-6 text-center"
              >
                <h3 className="font-heading text-lg font-semibold text-primary mb-3">
                  {getLocalizedText(value.title, locale)}
                </h3>
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  {getLocalizedText(value.description, locale)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </article>
  );
}
