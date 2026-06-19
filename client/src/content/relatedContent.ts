import { FOOD_SAFETY_ARTICLES, buildFoodSafetyPath } from './foodSafety';
import { GUIDE_ARTICLES, buildGuidePath } from './guides';

export interface RelatedLink {
  path: string;
  title: string;
}

export function resolveRelatedLinks(paths: string[] | undefined): RelatedLink[] {
  if (!paths || paths.length === 0) return [];
  return paths.reduce<RelatedLink[]>((links, path) => {
    const foodArticle = FOOD_SAFETY_ARTICLES.find(
      (article) => buildFoodSafetyPath(article) === path
    );
    if (foodArticle) {
      links.push({ path, title: foodArticle.title });
      return links;
    }
    const guideArticle = GUIDE_ARTICLES.find((article) => buildGuidePath(article) === path);
    if (guideArticle) {
      links.push({ path, title: guideArticle.title });
    }
    return links;
  }, []);
}
