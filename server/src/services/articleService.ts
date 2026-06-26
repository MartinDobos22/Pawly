import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import type {
  AdminArticle,
  Article,
  ArticleSection,
  ArticleSource,
  Block,
  CalloutVariant,
  FaqItem,
  TextAlign,
} from '../types/article';

type Row = Record<string, unknown>;

const TEXT_ALIGNS: TextAlign[] = ['left', 'center', 'right'];

const SELECT_COLUMNS =
  'slug, category, title, description, intro, sections, faqs, related_slugs, cover_image, cta_intent, author, sources, updated, position';

const SELECT_COLUMNS_ADMIN = `${SELECT_COLUMNS}, published`;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CALLOUT_VARIANTS: CalloutVariant[] = ['tip', 'warning', 'info'];

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function rowToArticle(row: Row): Article {
  return {
    slug: asString(row.slug),
    category: asString(row.category) === 'zdravie' ? 'zdravie' : 'krmivo',
    title: asString(row.title),
    description: asString(row.description),
    intro: asString(row.intro),
    sections: (Array.isArray(row.sections) ? row.sections : []) as ArticleSection[],
    faqs: (Array.isArray(row.faqs) ? row.faqs : []) as FaqItem[],
    relatedSlugs: asStringArray(row.related_slugs),
    updated: asString(row.updated),
    coverImage: asOptionalString(row.cover_image),
    ctaIntent: asString(row.cta_intent),
    author: asOptionalString(row.author),
    sources: (Array.isArray(row.sources) ? row.sources : []) as ArticleSource[],
  };
}

export async function listPublishedArticles(): Promise<Article[]> {
  const { data, error } = await getSupabase()
    .from('articles')
    .select(SELECT_COLUMNS)
    .eq('published', true)
    .order('position', { ascending: true });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(rowToArticle);
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await getSupabase()
    .from('articles')
    .select(SELECT_COLUMNS)
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data as Row) : null;
}

// ── Admin (write) ───────────────────────────────────────────────────────────

function rowToAdminArticle(row: Row): AdminArticle {
  return {
    ...rowToArticle(row),
    published: row.published === true,
    position: typeof row.position === 'number' ? row.position : 0,
  };
}

function bad(message: string): never {
  throw httpError(400, message, 'INVALID_INPUT');
}

function reqStr(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    bad(`Pole "${field}" je povinné.`);
  }
  return (value as string).trim();
}

function validateBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) bad('Pole "blocks" musí byť zoznam.');
  return (value as unknown[]).map((raw, i) => {
    if (!raw || typeof raw !== 'object') bad(`Blok #${i + 1} je neplatný.`);
    const b = raw as Record<string, unknown>;
    switch (b.type) {
      case 'paragraph': {
        const out: Block = { type: 'paragraph', text: reqStr(b.text, `blok #${i + 1} text`) };
        if (TEXT_ALIGNS.includes(b.align as TextAlign) && b.align !== 'left') {
          out.align = b.align as TextAlign;
        }
        return out;
      }
      case 'subheading':
        return { type: 'subheading', text: reqStr(b.text, `blok #${i + 1} text`) };
      case 'quote':
        return { type: 'quote', text: reqStr(b.text, `blok #${i + 1} text`) };
      case 'divider':
        return { type: 'divider' };
      case 'bullets': {
        if (!Array.isArray(b.items) || b.items.length === 0) bad(`Blok #${i + 1}: prázdny zoznam.`);
        const out: Block = {
          type: 'bullets',
          items: (b.items as unknown[]).map((it, j) =>
            reqStr(it, `blok #${i + 1} položka #${j + 1}`)
          ),
        };
        if (b.ordered === true) out.ordered = true;
        return out;
      }
      case 'callout': {
        const variant = b.variant as CalloutVariant;
        if (!CALLOUT_VARIANTS.includes(variant)) bad(`Blok #${i + 1}: neplatný variant calloutu.`);
        const out: Block = {
          type: 'callout',
          variant,
          text: reqStr(b.text, `blok #${i + 1} text`),
        };
        if (typeof b.title === 'string' && b.title.trim().length > 0) out.title = b.title.trim();
        return out;
      }
      default:
        return bad(`Blok #${i + 1}: neznámy typ.`);
    }
  });
}

function validateSections(value: unknown): ArticleSection[] {
  if (!Array.isArray(value)) bad('Pole "sections" musí byť zoznam.');
  return (value as unknown[]).map((raw, i) => {
    if (!raw || typeof raw !== 'object') bad(`Sekcia #${i + 1} je neplatná.`);
    const s = raw as Record<string, unknown>;
    return {
      heading: reqStr(s.heading, `sekcia #${i + 1} nadpis`),
      blocks: validateBlocks(s.blocks),
    };
  });
}

function validateFaqs(value: unknown): FaqItem[] {
  if (value == null) return [];
  if (!Array.isArray(value)) bad('Pole "faqs" musí byť zoznam.');
  return (value as unknown[]).map((raw, i) => {
    const f = (raw ?? {}) as Record<string, unknown>;
    return { q: reqStr(f.q, `FAQ #${i + 1} otázka`), a: reqStr(f.a, `FAQ #${i + 1} odpoveď`) };
  });
}

function validateSources(value: unknown): ArticleSource[] {
  if (value == null) return [];
  if (!Array.isArray(value)) bad('Pole "sources" musí byť zoznam.');
  return (value as unknown[]).map((raw, i) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    return {
      label: reqStr(s.label, `zdroj #${i + 1} názov`),
      url: reqStr(s.url, `zdroj #${i + 1} URL`),
    };
  });
}

interface ArticleRow {
  slug: string;
  category: string;
  title: string;
  description: string;
  intro: string;
  sections: ArticleSection[];
  faqs: FaqItem[];
  related_slugs: string[];
  cover_image: string | null;
  cta_intent: string;
  author: string | null;
  sources: ArticleSource[];
  updated: string;
  published: boolean;
  position: number;
}

function toRow(input: unknown): ArticleRow {
  if (!input || typeof input !== 'object') bad('Telo požiadavky musí byť objekt.');
  const a = input as Record<string, unknown>;

  const slug = reqStr(a.slug, 'slug').toLowerCase();
  if (!SLUG_RE.test(slug)) bad('Slug smie obsahovať len malé písmená, číslice a pomlčky.');

  const category = reqStr(a.category, 'category');
  if (category !== 'krmivo' && category !== 'zdravie')
    bad('Kategória musí byť "krmivo" alebo "zdravie".');

  return {
    slug,
    category,
    title: reqStr(a.title, 'title'),
    description: reqStr(a.description, 'description'),
    intro: reqStr(a.intro, 'intro'),
    sections: validateSections(a.sections),
    faqs: validateFaqs(a.faqs),
    related_slugs: Array.isArray(a.relatedSlugs)
      ? (a.relatedSlugs as unknown[]).filter((s): s is string => typeof s === 'string')
      : [],
    cover_image:
      typeof a.coverImage === 'string' && a.coverImage.trim().length > 0
        ? a.coverImage.trim()
        : null,
    cta_intent: reqStr(a.ctaIntent, 'ctaIntent'),
    author: typeof a.author === 'string' && a.author.trim().length > 0 ? a.author.trim() : null,
    sources: validateSources(a.sources),
    updated:
      typeof a.updated === 'string' && a.updated.trim().length > 0
        ? a.updated.trim()
        : new Date().toISOString().slice(0, 10),
    published: a.published !== false,
    position: typeof a.position === 'number' && Number.isFinite(a.position) ? a.position : 0,
  };
}

export async function listAllArticles(): Promise<AdminArticle[]> {
  const { data, error } = await getSupabase()
    .from('articles')
    .select(SELECT_COLUMNS_ADMIN)
    .order('position', { ascending: true });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(rowToAdminArticle);
}

export async function listAllArticlesWithId(): Promise<{ id: string; article: AdminArticle }[]> {
  const { data, error } = await getSupabase()
    .from('articles')
    .select(`id, ${SELECT_COLUMNS_ADMIN}`)
    .order('position', { ascending: true });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map((row) => ({
    id: String(row.id),
    article: rowToAdminArticle(row),
  }));
}

export async function getArticleBySlugAdmin(slug: string): Promise<AdminArticle | null> {
  const { data, error } = await getSupabase()
    .from('articles')
    .select(SELECT_COLUMNS_ADMIN)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToAdminArticle(data as Row) : null;
}

export async function createArticle(input: unknown): Promise<AdminArticle> {
  const row = toRow(input);
  const { data, error } = await getSupabase()
    .from('articles')
    .insert(row)
    .select(SELECT_COLUMNS_ADMIN)
    .single();
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw httpError(409, 'Článok s týmto slugom už existuje.', 'SLUG_EXISTS');
    }
    throw error;
  }
  return rowToAdminArticle(data as Row);
}

export async function updateArticle(slug: string, input: unknown): Promise<AdminArticle> {
  const row = toRow({ ...(input as object), slug });
  const { data, error } = await getSupabase()
    .from('articles')
    .update(row)
    .eq('slug', slug)
    .select(SELECT_COLUMNS_ADMIN)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw httpError(404, 'Článok sa nenašiel.', 'NOT_FOUND');
  return rowToAdminArticle(data as Row);
}

export async function deleteArticle(slug: string): Promise<void> {
  const { error } = await getSupabase().from('articles').delete().eq('slug', slug);
  if (error) throw error;
}
