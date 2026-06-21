import type { FaqItem } from '../../utils/seoSchema';
import type { OnboardingIntent } from '../../utils/onboardingIntent';

export type ArticleCategory = 'krmivo' | 'zdravie';

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  category: ArticleCategory;
  title: string;
  /** Meta description + perex v zozname. */
  description: string;
  /** Úvodný odsek pod H1. */
  intro: string;
  sections: ArticleSection[];
  faqs?: FaqItem[];
  relatedSlugs?: string[];
  /** ISO dátum poslednej aktualizácie (pre Article schema). */
  updated: string;
  /** CTA na konci článku → registrácia s daným intentom. */
  ctaIntent: OnboardingIntent;
}
