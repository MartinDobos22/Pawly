import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import { listAllArticlesWithId, updateArticle } from './articleService';
import type { AdminArticle } from '../types/article';
import type {
  ArticleVersion,
  ArticleVersionKind,
  ArticleVersionMeta,
} from '../types/articleVersion';

type Row = Record<string, unknown>;

const META_COLUMNS = 'id, version_number, kind, change_summary, created_by, created_at';

async function getArticleId(slug: string): Promise<string> {
  const { data, error } = await getSupabase()
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw httpError(404, 'Článok sa nenašiel.', 'NOT_FOUND');
  return String((data as Row).id);
}

function rowToMeta(row: Row): ArticleVersionMeta {
  return {
    id: String(row.id),
    versionNumber: Number(row.version_number),
    kind: (typeof row.kind === 'string' ? row.kind : 'manual') as ArticleVersionKind,
    changeSummary: typeof row.change_summary === 'string' ? row.change_summary : null,
    createdBy: typeof row.created_by === 'string' ? row.created_by : null,
    createdAt: String(row.created_at),
  };
}

async function insertVersion(params: {
  articleId: string;
  data: AdminArticle;
  kind: ArticleVersionKind;
  createdBy: string | null;
  changeSummary: string | null;
}): Promise<void> {
  // version_number je per-článok rastúce; pri súbehu (zriedkavé, jeden admin)
  // unique constraint zachytí kolíziu a skúsime znova s novým max+1.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: maxRow, error: maxErr } = await getSupabase()
      .from('article_versions')
      .select('version_number')
      .eq('article_id', params.articleId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxErr) throw maxErr;
    const next = (maxRow ? Number((maxRow as Row).version_number) : 0) + 1;

    const { error } = await getSupabase().from('article_versions').insert({
      article_id: params.articleId,
      version_number: next,
      data: params.data,
      kind: params.kind,
      change_summary: params.changeSummary,
      created_by: params.createdBy,
    });
    if (!error) return;
    if ((error as { code?: string }).code === '23505' && attempt < 2) continue;
    throw error;
  }
}

export async function recordArticleVersionBySlug(params: {
  slug: string;
  data: AdminArticle;
  kind: ArticleVersionKind;
  createdBy?: string | null;
  changeSummary?: string | null;
}): Promise<void> {
  const articleId = await getArticleId(params.slug);
  await insertVersion({
    articleId,
    data: params.data,
    kind: params.kind,
    createdBy: params.createdBy ?? null,
    changeSummary: params.changeSummary ?? null,
  });
}

const AUTOSAVE_KEEP = 10;

// Autosave neukladá do živého článku — len zapíše snapshot verzie 'autosave',
// takže rozpracovaná práca sa nestratí, ale verejný obsah ostáva nedotknutý.
// Staré autosave verzie sa prerezávajú (ponechá sa posledných AUTOSAVE_KEEP).
export async function recordAutosaveVersion(params: {
  slug: string;
  data: AdminArticle;
  createdBy?: string | null;
}): Promise<{ savedAt: string }> {
  const articleId = await getArticleId(params.slug);
  await insertVersion({
    articleId,
    data: params.data,
    kind: 'autosave',
    createdBy: params.createdBy ?? null,
    changeSummary: 'Automatické uloženie',
  });

  const { data: stale, error } = await getSupabase()
    .from('article_versions')
    .select('id')
    .eq('article_id', articleId)
    .eq('kind', 'autosave')
    .order('version_number', { ascending: false })
    .range(AUTOSAVE_KEEP, AUTOSAVE_KEEP + 1000);
  if (error) throw error;
  const ids = ((stale as Row[] | null) ?? []).map((r) => String(r.id));
  if (ids.length > 0) {
    await getSupabase().from('article_versions').delete().in('id', ids);
  }

  return { savedAt: new Date().toISOString() };
}

export async function listArticleVersions(slug: string): Promise<ArticleVersionMeta[]> {
  const articleId = await getArticleId(slug);
  const { data, error } = await getSupabase()
    .from('article_versions')
    .select(META_COLUMNS)
    .eq('article_id', articleId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(rowToMeta);
}

export async function getArticleVersion(slug: string, versionId: string): Promise<ArticleVersion> {
  const articleId = await getArticleId(slug);
  const { data, error } = await getSupabase()
    .from('article_versions')
    .select(`${META_COLUMNS}, data`)
    .eq('article_id', articleId)
    .eq('id', versionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw httpError(404, 'Verzia sa nenašla.', 'NOT_FOUND');
  const row = data as Row;
  return { ...rowToMeta(row), data: row.data as AdminArticle };
}

export async function restoreArticleVersion(
  slug: string,
  versionId: string,
  createdBy?: string | null
): Promise<AdminArticle> {
  const version = await getArticleVersion(slug, versionId);
  // Rollback je nedeštruktívny: obnoví dáta a vytvorí novú verziu, takže
  // sa nič nestratí a história ostáva úplná.
  const updated = await updateArticle(slug, version.data);
  await recordArticleVersionBySlug({
    slug,
    data: updated,
    kind: 'restore',
    createdBy,
    changeSummary: `Obnovené z verzie ${version.versionNumber}`,
  });
  return updated;
}

export async function snapshotPublishedArticles(createdBy?: string | null): Promise<void> {
  const all = await listAllArticlesWithId();
  for (const { id, article } of all) {
    if (!article.published) continue;
    await insertVersion({
      articleId: id,
      data: article,
      kind: 'publish',
      createdBy: createdBy ?? null,
      changeSummary: 'Snapshot pri publikovaní',
    });
  }
}
