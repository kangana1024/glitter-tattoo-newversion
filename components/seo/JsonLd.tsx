// schema-dts types used for reference only

const SITE_URL = 'https://www.glitter-tattoo.com';

interface JsonLdProps {
  locale: string;
}

export function LocalBusinessJsonLd({ locale }: JsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'LocalBusiness' as const,
    name: 'Glitter Tattoo Thailand',
    url: SITE_URL,
    image: `${SITE_URL}/images/logo.png`,
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

interface WebPageJsonLdProps {
  title: string;
  description: string;
  url: string;
  locale: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function WebPageJsonLd({ title, description, url, locale, breadcrumbs }: WebPageJsonLdProps) {
  const webPageLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'WebPage' as const,
    name: title,
    description,
    url: `${SITE_URL}${url}`,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite' as const,
      name: 'Glitter Tattoo Thailand',
      url: SITE_URL,
    },
  };

  const breadcrumbLd = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org' as const,
    '@type': 'BreadcrumbList' as const,
    itemListElement: breadcrumbs.map((item, i) => ({
      '@type': 'ListItem' as const,
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageLd).replace(/</g, '\\u003c'),
        }}
      />
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </>
  );
}
