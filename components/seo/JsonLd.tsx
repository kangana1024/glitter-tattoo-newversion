// schema-dts types used for reference only

interface JsonLdProps {
  locale: string;
}

export function LocalBusinessJsonLd({ locale }: JsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'LocalBusiness' as const,
    name: 'Glitter Tattoo Thailand',
    url: 'https://www.glitter-tattoo.com',
    image: 'https://www.glitter-tattoo.com/images/logo.png',
    description: 'Professional glitter tattoo supplies and stencils manufacturer',
    address: {
      '@type': 'PostalAddress' as const,
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
