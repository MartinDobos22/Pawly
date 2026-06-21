import { SITE_URL } from '../components/Seo';

export interface FaqItem {
  q: string;
  a: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function softwareApplicationSchema() {
  return {
    '@type': 'SoftwareApplication',
    name: 'Pawly',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    url: SITE_URL,
  };
}

export function faqPageSchema(faqs: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

/** Skombinuje viac schém do jedného JSON-LD grafu pre <script>. */
export function landingJsonLd(opts: {
  faqs: FaqItem[];
  breadcrumbs: BreadcrumbItem[];
}): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      softwareApplicationSchema(),
      faqPageSchema(opts.faqs),
      breadcrumbSchema(opts.breadcrumbs),
    ],
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  path: string;
  updated: string;
}) {
  return {
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    dateModified: opts.updated,
    mainEntityOfPage: `${SITE_URL}${opts.path}`,
    author: { '@type': 'Organization', name: 'Pawly', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Pawly', url: SITE_URL },
  };
}

/** JSON-LD graf pre článok poradne (Article + voliteľné FAQ + breadcrumb). */
export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  updated: string;
  faqs?: FaqItem[];
  breadcrumbs: BreadcrumbItem[];
}): object {
  const graph: object[] = [
    articleSchema(opts),
    breadcrumbSchema(opts.breadcrumbs),
  ];
  if (opts.faqs && opts.faqs.length > 0) graph.push(faqPageSchema(opts.faqs));
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON-LD pre rozcestník poradne (CollectionPage + ItemList + breadcrumb). */
export function collectionJsonLd(opts: {
  items: { name: string; path: string }[];
  breadcrumbs: BreadcrumbItem[];
}): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        hasPart: {
          '@type': 'ItemList',
          itemListElement: opts.items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            url: `${SITE_URL}${it.path}`,
          })),
        },
      },
      breadcrumbSchema(opts.breadcrumbs),
    ],
  };
}
