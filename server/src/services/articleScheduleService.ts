import { getSupabase } from '../config/supabase';

// Naplánované publikovanie/stiahnutie článkov. Volá sa z cronu
// (POST /api/cron/articles-schedule) externým schedulerom. `published` flag
// (verejná viditeľnosť) sa drží v súlade so status.
export async function runArticleSchedule(): Promise<{ published: number; unpublished: number }> {
  const now = new Date().toISOString();
  const sb = getSupabase();

  const { data: published, error: publishErr } = await sb
    .from('articles')
    .update({ status: 'published', published: true, published_at: now })
    .eq('status', 'scheduled')
    .lte('publish_at', now)
    .select('id');
  if (publishErr) throw publishErr;

  const { data: unpublished, error: unpublishErr } = await sb
    .from('articles')
    .update({ status: 'archived', published: false })
    .eq('status', 'published')
    .not('unpublish_at', 'is', null)
    .lte('unpublish_at', now)
    .select('id');
  if (unpublishErr) throw unpublishErr;

  return {
    published: (published ?? []).length,
    unpublished: (unpublished ?? []).length,
  };
}
