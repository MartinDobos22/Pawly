import type { FaqItem } from '../../utils/seoSchema';
import type { OnboardingIntent } from '../../utils/onboardingIntent';

export type ArticleCategory = 'krmivo' | 'zdravie';

export type CalloutVariant = 'tip' | 'warning' | 'info';

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'subheading'; text: string }
  | { type: 'callout'; variant: CalloutVariant; title?: string; text: string };

export interface ArticleSection {
  heading: string;
  blocks: Block[];
}

export interface ArticleSource {
  label: string;
  url: string;
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
  /** URL titulného obrázka (zatiaľ Unsplash placeholder, neskôr vlastné). */
  coverImage?: string;
  /** CTA na konci článku → registrácia s daným intentom. */
  ctaIntent: OnboardingIntent;
  /** Autorský riadok (E-E-A-T). Default „Tím Pawly" ak chýba. */
  author?: string;
  /** Zdroje (E-E-A-T) — externé odkazy na konci článku. */
  sources?: ArticleSource[];
}
