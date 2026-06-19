import type { ContentSpecies, FoodSafetyArticle } from './types';
import { cesnakPes } from './cesnakPes';
import { cibulaPes } from './cibulaPes';
import { cokoladaPes } from './cokoladaPes';
import { hroznoPes } from './hroznoPes';
import { xylitolPes } from './xylitolPes';
import { makadamioveOrechyPes } from './makadamioveOrechyPes';
import { avokadoPes } from './avokadoPes';
import { vareneKostiPes } from './vareneKostiPes';
import { cibulaMacka } from './cibulaMacka';
import { cokoladaMacka } from './cokoladaMacka';

export * from './types';

export const FOOD_SAFETY_ARTICLES: FoodSafetyArticle[] = [
  cesnakPes,
  cibulaPes,
  cokoladaPes,
  hroznoPes,
  xylitolPes,
  makadamioveOrechyPes,
  avokadoPes,
  vareneKostiPes,
  cibulaMacka,
  cokoladaMacka,
];

const SPECIES_PATH_PREFIX: Record<ContentSpecies, string> = {
  dog: '/moze-pes-jest',
  cat: '/moze-macka-jest',
};

export function buildFoodSafetyPath(article: Pick<FoodSafetyArticle, 'species' | 'slug'>): string {
  return `${SPECIES_PATH_PREFIX[article.species]}-${article.slug}`;
}

export function getFoodSafetyArticleByPath(pathname: string): FoodSafetyArticle | undefined {
  return FOOD_SAFETY_ARTICLES.find((article) => buildFoodSafetyPath(article) === pathname);
}
