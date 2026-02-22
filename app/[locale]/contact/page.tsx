import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n';
import Container from '@/components/ui/Container';
import ContactForm from '@/components/sections/ContactForm';
import contactData from '@/content/pages/contact.json';
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
  const heading = getLocalizedText(contactData.sections.heading, locale);

  return {
    title: heading,
    description: contactData.description,
    openGraph: {
      title: heading,
      description: contactData.description,
      url: `https://www.glitter-tattoo.com/${locale}/contact`,
    },
    alternates: {
      canonical: `https://www.glitter-tattoo.com/${locale}/contact`,
      languages: { en: '/en/contact', th: '/th/contact', zh: '/zh/contact' },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const heading = getLocalizedText(contactData.sections.heading, locale);
  const intro = getLocalizedText(contactData.sections.intro, locale);
  const contactInfo = contactData.sections.contact_info;
  const location = contactData.sections.location;

  return (
    <article className="py-16 sm:py-20 lg:py-24">
      <Container>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-6">
          {heading}
        </h1>
        <p className="font-body text-lg text-text-secondary text-center max-w-2xl mx-auto mb-16">
          {intro}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  {getLocalizedText(contactInfo.phone.label, locale)}
                </h3>
                <p className="font-body text-text-secondary">{contactInfo.phone.value}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  {getLocalizedText(contactInfo.email.label, locale)}
                </h3>
                <p className="font-body text-text-secondary">{contactInfo.email.value}</p>
              </div>
            </div>

            {/* LINE */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  {getLocalizedText(contactInfo.line.label, locale)}
                </h3>
                <p className="font-body text-text-secondary">{contactInfo.line.value}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  {getLocalizedText(location.label, locale)}
                </h3>
                <p className="font-body text-text-secondary">{getLocalizedText(location.address, locale)}</p>
                <p className="font-body text-sm text-text-secondary/70 mt-1">{getLocalizedText(location.note, locale)}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-surface rounded-xl shadow-md p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Container>
    </article>
  );
}
