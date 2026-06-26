import type { AdminArticle } from '../content/poradna/types';

export type SeoCheckStatus = 'ok' | 'warning' | 'error' | 'info';

export interface SeoCheck {
  id: string;
  label: string;
  status: SeoCheckStatus;
  detail?: string;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function collectText(article: AdminArticle): string {
  return article.sections
    .flatMap((s) =>
      s.blocks.flatMap((b) => {
        switch (b.type) {
          case 'paragraph':
          case 'subheading':
          case 'quote':
          case 'callout':
            return [b.text];
          case 'bullets':
            return b.items;
          default:
            return [];
        }
      })
    )
    .join('\n');
}

// Hľadá interný markdown-lite odkaz: [text](/cesta)
const INTERNAL_LINK_RE = /\]\(\/[^)]*\)/;

export function analyzeSeo(article: AdminArticle): SeoCheck[] {
  const checks: SeoCheck[] = [];
  const title = article.title.trim();
  const description = article.description.trim();
  const text = collectText(article);

  checks.push({
    id: 'h1',
    label: 'H1 (titulok) vyplnený a jediný',
    status: title.length > 0 ? 'ok' : 'error',
    detail:
      title.length > 0
        ? 'Telo článku používa len H2/H3, takže H1 je práve jeden.'
        : 'Titulok je prázdny — chýba H1.',
  });

  const titleLen = title.length;
  checks.push({
    id: 'titleLen',
    label: 'Dĺžka titulku',
    status: titleLen === 0 ? 'error' : titleLen >= 20 && titleLen <= 60 ? 'ok' : 'warning',
    detail: `${titleLen} znakov (ideál 20–60).`,
  });

  const descLen = description.length;
  checks.push({
    id: 'descLen',
    label: 'Dĺžka meta popisu',
    status: descLen === 0 ? 'error' : descLen >= 120 && descLen <= 160 ? 'ok' : 'warning',
    detail: `${descLen} znakov (ideál 120–160).`,
  });

  const slug = article.slug.trim();
  checks.push({
    id: 'slug',
    label: 'Validný slug',
    status: slug.length > 0 && SLUG_RE.test(slug) ? 'ok' : 'error',
    detail:
      slug.length === 0
        ? 'Slug je prázdny.'
        : SLUG_RE.test(slug)
          ? `/${slug}`
          : 'Slug smie obsahovať len malé písmená, číslice a pomlčky.',
  });

  checks.push({
    id: 'canonical',
    label: 'Canonical URL',
    status: slug.length > 0 && SLUG_RE.test(slug) ? 'ok' : 'warning',
    detail: 'Generuje sa automaticky zo slugu pri zobrazení.',
  });

  checks.push({
    id: 'cover',
    label: 'Cover obrázok',
    status: (article.coverImage ?? '').trim().length > 0 ? 'ok' : 'warning',
    detail: 'Cover je dekoratívne CSS pozadie (alt text netreba). Použije sa aj pre og:image.',
  });

  checks.push({
    id: 'intro',
    label: 'Úvodný odsek (intro)',
    status: article.intro.trim().length > 0 ? 'ok' : 'warning',
  });

  checks.push({
    id: 'internalLink',
    label: 'Aspoň jeden interný odkaz',
    status: INTERNAL_LINK_RE.test(text) ? 'ok' : 'warning',
    detail: 'Interný odkaz píš ako [text](/cesta) — pomáha prelinkovaniu a SEO.',
  });

  const isHealth = article.category === 'zdravie';
  const sourcesCount = (article.sources ?? []).filter((s) => s.url.trim()).length;
  checks.push({
    id: 'sources',
    label: isHealth ? 'Zdroje (zdravotný článok)' : 'Zdroje',
    status: isHealth ? (sourcesCount > 0 ? 'ok' : 'error') : sourcesCount > 0 ? 'ok' : 'info',
    detail: isHealth
      ? sourcesCount > 0
        ? `${sourcesCount} zdroj(ov).`
        : 'Zdravotný článok by mal mať aspoň jeden zdroj (E-E-A-T).'
      : `${sourcesCount} zdroj(ov).`,
  });

  const faqCount = (article.faqs ?? []).filter((f) => f.q.trim() && f.a.trim()).length;
  checks.push({
    id: 'faq',
    label: 'FAQ obsah',
    status: 'info',
    detail:
      `${faqCount} otázok. Pozn.: FAQ rich results sa už v Google Search nezobrazujú (2026) — ` +
      'FAQ je užitočné pre používateľov, ale nerátaj s ním ako so SEO výhodou.',
  });

  return checks;
}

export function seoSummary(checks: SeoCheck[]): { errors: number; warnings: number } {
  return {
    errors: checks.filter((c) => c.status === 'error').length,
    warnings: checks.filter((c) => c.status === 'warning').length,
  };
}
