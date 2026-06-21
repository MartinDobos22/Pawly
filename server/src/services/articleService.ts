import { getSupabase } from '../config/supabase';
import type { Article, ArticleSection, ArticleSource, FaqItem } from '../types/article';

type Row = Record<string, unknown>;

const SELECT_COLUMNS =
  'slug, category, title, description, intro, sections, faqs, related_slugs, cover_image, cta_intent, author, sources, updated, position';

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
