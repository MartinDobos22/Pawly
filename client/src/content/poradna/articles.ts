import type { Article, ArticleCategory } from './types';
import articlesData from './articles.data.json';

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  krmivo: 'Krmivo a výživa',
  zdravie: 'Zdravie a prevencia',
};

export const CATEGORY_COLORS: Record<ArticleCategory, 'success' | 'info'> = {
  krmivo: 'success',
  zdravie: 'info',
};

// Zdroj pravdy pre obsah je Supabase tabuľka `articles`. `articles.data.json` je
// committed mirror (seed + build fallback): build ho pred prerenderom obnoví z DB
// cez `scripts/syncArticles.mjs`; ak DB nie je dostupná, použije sa posledný
// committed obsah. Tvar JSON 1:1 zodpovedá typu `Article` (viď migrácia 0018/0019).
export const articles: Article[] = articlesData as unknown as Article[];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function articlesByCategory(): Record<ArticleCategory, Article[]> {
  return {
    krmivo: articles.filter((a) => a.category === 'krmivo'),
    zdravie: articles.filter((a) => a.category === 'zdravie'),
  };
}
