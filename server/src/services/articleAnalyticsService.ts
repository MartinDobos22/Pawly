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

export async function getArticleMetrics(sinceDays = 30, slug?: string): Promise<ArticleMetrics[]> {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabase().rpc('article_metrics', {
    p_since: since,
    p_slug: slug ?? null,
  });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(rowToMetrics);
}

export async function getArticleMetric(slug: string, sinceDays = 30): Promise<ArticleMetrics> {
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
