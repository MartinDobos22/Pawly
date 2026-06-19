import type { GuideArticle } from './types';
import { akoOdcervitPsa } from './akoOdcervitPsa';
import { pesZjedolNiecoToxicke } from './pesZjedolNiecoToxicke';
import { alergiaNaKrmivoPes } from './alergiaNaKrmivoPes';
import { akoRozpoznatOtravuPsa } from './akoRozpoznatOtravuPsa';

export * from './types';

export const GUIDE_ARTICLES: GuideArticle[] = [
  akoOdcervitPsa,
  pesZjedolNiecoToxicke,
  alergiaNaKrmivoPes,
  akoRozpoznatOtravuPsa,
];

export function buildGuidePath(article: Pick<GuideArticle, 'slug'>): string {
  return `/rady/${article.slug}`;
}

export function getGuideArticleByPath(pathname: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => buildGuidePath(article) === pathname);
}
