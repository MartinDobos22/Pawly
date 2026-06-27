// Build-time sync: načíta verejné články zo Supabase a prepíše committed mirror
// `src/content/poradna/articles.data.json`, ktorý konzumuje SPA aj prerender.
//
// Bezpečnostná zásada: build NIKDY nesmie spadnúť kvôli tomuto skriptu.
// - chýbajúce env alebo nedostupná DB → ponechá posledný committed mirror (fallback),
// - prázdna odpoveď z DB → ponechá fallback (nechceme vymazať obsah),
// - akákoľvek chyba → varovanie + exit 0.
//
// Env (build, server-side — NEbundluje sa do klienta):
//   SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY (alebo SUPABASE_SERVICE_KEY).

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIRROR_PATH = resolve(__dirname, '../src/content/poradna/articles.data.json');

const SELECT =
  'slug,category,title,description,intro,sections,faqs,related_slugs,cover_image,cover_alt,cta_intent,author,sources,updated,reviewed_by,reviewed_at,reviewer_title,medical_reviewed_at,disclaimer';

function normalizeUrl(raw) {
  return raw
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/, '')
    .replace(/\/+$/, '');
}

function rowToArticle(row) {
  return {
    slug: row.slug,
    category: row.category,
    title: row.title,
    description: row.description,
    intro: row.intro,
    sections: row.sections ?? [],
    faqs: row.faqs ?? [],
    relatedSlugs: row.related_slugs ?? [],
    updated: row.updated,
    coverImage: row.cover_image ?? undefined,
    coverAlt: row.cover_alt ?? undefined,
    ctaIntent: row.cta_intent,
    author: row.author ?? undefined,
    sources: row.sources ?? [],
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewerTitle: row.reviewer_title ?? undefined,
    medicalReviewedAt: row.medical_reviewed_at ?? undefined,
    disclaimer: row.disclaimer ?? undefined,
  };
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.warn('[syncArticles] SUPABASE_URL/kľúč nie sú nastavené — používam committed mirror (fallback).');
    return;
  }

  const endpoint =
    `${normalizeUrl(url)}/rest/v1/articles` +
    `?select=${encodeURIComponent(SELECT)}&published=eq.true&order=position.asc`;

  let rows;
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`[syncArticles] Supabase odpoveď ${res.status} — ponechávam fallback.`);
      return;
    }
    rows = await res.json();
  } catch (err) {
    console.warn(`[syncArticles] fetch zlyhal (${err?.message ?? err}) — ponechávam fallback.`);
    return;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('[syncArticles] DB vrátila 0 článkov — ponechávam fallback (nevymazávam obsah).');
    return;
  }

  const articles = rows.map(rowToArticle);
  await writeFile(MIRROR_PATH, JSON.stringify(articles, null, 2) + '\n', 'utf8');
  console.log(`[syncArticles] mirror obnovený z DB — ${articles.length} článkov.`);
}

main().catch((err) => {
  console.warn(`[syncArticles] neočakávaná chyba (${err?.message ?? err}) — ponechávam fallback.`);
});
