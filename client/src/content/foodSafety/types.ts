export type FoodSafetyVerdict = 'SAFE' | 'CAUTION' | 'UNSAFE';
export type ContentSpecies = 'dog' | 'cat';

export interface ContentSource {
  label: string;
  url: string;
}

export interface FoodSafetyArticle {
  slug: string;
  species: ContentSpecies;
  foodName: string;
  title: string;
  metaDescription: string;
  verdict: FoodSafetyVerdict;
  shortAnswer: string;
  explanation: string;
  warnings?: string[];
  alternatives?: string[];
  sources: ContentSource[];
  lastReviewed: string;
  relatedPaths?: string[];
}
