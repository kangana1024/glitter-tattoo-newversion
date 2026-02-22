import type { WithContext, LocalBusiness } from 'schema-dts';

interface JsonLdProps {
  locale: string;
}

export function LocalBusinessJsonLd({ locale }: JsonLdProps) {
  const jsonLd: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Glitter Tattoo Thailand',
    url: 'https://www.glitter-tattoo.com',
    image: 'https://www.glitter-tattoo.com/images/logo.png',
    description: 'Professional glitter tattoo supplies and stencils manufacturer',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TH',
    },
    telephone: '+66-XX-XXX-XXXX',
    priceRange: '$$',
    inLanguage: locale,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}
