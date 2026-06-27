import type { AdminArticle, ArticleMetrics } from '../content/poradna/types';

export interface RefreshFlag {
  key: string;
  message: string;
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;
const MIN_VIEWS = 50; // pod týmto počtom sú metriky štatisticky nespoľahlivé

// Označí články, ktoré si pravdepodobne zaslúžia content refresh.
export function articleRefreshFlags(
  article: Pick<AdminArticle, 'updated' | 'category'>,
  metrics: ArticleMetrics | null
): RefreshFlag[] {
  const flags: RefreshFlag[] = [];
  const updatedMs = new Date(article.updated).getTime();
  const stale = !Number.isNaN(updatedMs) && Date.now() - updatedMs > SIX_MONTHS_MS;

  if (stale) {
    flags.push({ key: 'stale', message: 'Neaktualizované viac ako 6 mesiacov.' });
  }
  if (stale && article.category === 'zdravie') {
    flags.push({
      key: 'health_stale',
      message: 'Zdravotný článok bez recentnej kontroly.',
    });
  }
  if (metrics && metrics.views >= MIN_VIEWS) {
    if (metrics.ctr < 0.02) {
      flags.push({ key: 'low_cta', message: 'Veľa zobrazení, ale málo CTA klikov.' });
    }
    if (metrics.views > 0 && metrics.scroll90 / metrics.views < 0.2) {
      flags.push({
        key: 'low_scroll',
        message: 'Nízky scroll do konca (možný vysoký bounce).',
      });
    }
  }
  return flags;
}
