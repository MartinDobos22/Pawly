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
