import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';

export const ARTICLE_EVENT_TYPES = [
  'view',
  'cta_click',
  'scroll_50',
  'scroll_90',
  'related_click',
  'source_click',
] as const;

export type ArticleEventType = (typeof ARTICLE_EVENT_TYPES)[number];

export interface ArticleMetrics {
  slug: string;
  views: number;
  ctaClicks: number;
  scroll50: number;
  scroll90: number;
  relatedClicks: number;
  sourceClicks: number;
  /** cta_clicks / views (0 ak žiadne zobrazenia). */
  ctr: number;
}

/** Súhrnné čísla naprieč všetkými článkami za dané obdobie. */
export interface ArticleMetricsSummary {
  views: number;
  ctaClicks: number;
  scroll50: number;
  scroll90: number;
  relatedClicks: number;
  sourceClicks: number;
  /** ctaClicks / views (0 ak žiadne zobrazenia). */
  ctr: number;
  /** scroll90 / views — miera dočítania (0 ak žiadne zobrazenia). */
  readThroughRate: number;
  /** Počet článkov s aspoň jedným zobrazením v danom období. */
  articlesWithViews: number;
}

export const METRICS_PERIODS = ['30d', '90d', 'all'] as const;
export type MetricsPeriod = (typeof METRICS_PERIODS)[number];

/** Prevedie obdobie na počet dní späť; `null` = celá história (bez filtra). */
export function periodToSinceDays(period: MetricsPeriod): number | null {
  switch (period) {
    case '30d':
      return 30;
    case '90d':
      return 90;
    case 'all':
      return null;
  }
}

/** Bezpečne rozparsuje query param na `MetricsPeriod` (default `30d`). */
export function parseMetricsPeriod(value: unknown): MetricsPeriod {
  return typeof value === 'string' && (METRICS_PERIODS as readonly string[]).includes(value)
    ? (value as MetricsPeriod)
    : '30d';
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
type Row = Record<string, unknown>;

function num(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

function rowToMetrics(row: Row): ArticleMetrics {
  const views = num(row.views);
  const ctaClicks = num(row.cta_clicks);
  return {
    slug: String(row.article_slug),
    views,
    ctaClicks,
    scroll50: num(row.scroll_50),
    scroll90: num(row.scroll_90),
    relatedClicks: num(row.related_clicks),
    sourceClicks: num(row.source_clicks),
    ctr: views > 0 ? ctaClicks / views : 0,
  };
}

export async function recordArticleEvent(input: unknown): Promise<void> {
  if (!input || typeof input !== 'object') {
    throw httpError(400, 'Telo požiadavky musí byť objekt.', 'INVALID_INPUT');
  }
  const body = input as Record<string, unknown>;
  const slug = typeof body.articleSlug === 'string' ? body.articleSlug.trim().toLowerCase() : '';
  if (!SLUG_RE.test(slug)) throw httpError(400, 'Neplatný articleSlug.', 'INVALID_INPUT');

  const eventType = body.eventType as ArticleEventType;
  if (!ARTICLE_EVENT_TYPES.includes(eventType)) {
    throw httpError(400, 'Neplatný eventType.', 'INVALID_INPUT');
  }

  // metadata držíme malé — uložíme len ak je to plytký objekt (anti-spam/abuse).
  let metadata: Record<string, unknown> = {};
  if (body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)) {
    const serialized = JSON.stringify(body.metadata);
    if (serialized.length <= 1000) metadata = body.metadata as Record<string, unknown>;
  }

  const { error } = await getSupabase()
    .from('article_events')
    .insert({ article_slug: slug, event_type: eventType, metadata });
  if (error) throw error;
}

export async function getArticleMetrics(
  sinceDays: number | null = 30,
  slug?: string
): Promise<ArticleMetrics[]> {
  const since =
    sinceDays === null
      ? null
      : new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabase().rpc('article_metrics', {
    p_since: since,
    p_slug: slug ?? null,
  });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(rowToMetrics);
}

export function summarizeMetrics(rows: ArticleMetrics[]): ArticleMetricsSummary {
  const totals = rows.reduce(
    (acc, m) => {
      acc.views += m.views;
      acc.ctaClicks += m.ctaClicks;
      acc.scroll50 += m.scroll50;
      acc.scroll90 += m.scroll90;
      acc.relatedClicks += m.relatedClicks;
      acc.sourceClicks += m.sourceClicks;
      if (m.views > 0) acc.articlesWithViews += 1;
      return acc;
    },
    {
      views: 0,
      ctaClicks: 0,
      scroll50: 0,
      scroll90: 0,
      relatedClicks: 0,
      sourceClicks: 0,
      articlesWithViews: 0,
    }
  );
  return {
    ...totals,
    ctr: totals.views > 0 ? totals.ctaClicks / totals.views : 0,
    readThroughRate: totals.views > 0 ? totals.scroll90 / totals.views : 0,
  };
}

export async function getArticleMetric(
  slug: string,
  sinceDays: number | null = 30
): Promise<ArticleMetrics> {
  const rows = await getArticleMetrics(sinceDays, slug);
  return (
    rows[0] ?? {
      slug,
      views: 0,
      ctaClicks: 0,
      scroll50: 0,
      scroll90: 0,
      relatedClicks: 0,
      sourceClicks: 0,
      ctr: 0,
    }
  );
}
