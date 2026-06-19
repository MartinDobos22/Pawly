import type { ContentSource, ContentSpecies } from '../foodSafety/types';

export interface GuideStep {
  heading: string;
  body: string;
}

export interface GuideArticle {
  slug: string;
  species?: ContentSpecies;
  title: string;
  metaDescription: string;
  intro: string;
  steps: GuideStep[];
  warnings?: string[];
  sources: ContentSource[];
  lastReviewed: string;
  relatedPaths?: string[];
}
