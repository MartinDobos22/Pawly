// Verejné články poradne — server-side zrkadlo klientských typov
// (client/src/content/poradna/types.ts). Drift pravidlo: pri zmene tvaru
// uprav typy na oboch stranách aj SQL migráciu/seed.

export type ArticleCategory = 'krmivo' | 'zdravie';

export type CalloutVariant = 'tip' | 'warning' | 'info';

export type TextAlign = 'left' | 'center' | 'right';

export type Block =
  | { type: 'paragraph'; text: string; align?: TextAlign }
  | { type: 'bullets'; ordered?: boolean; items: string[] }
  | { type: 'subheading'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'divider' }
  | { type: 'callout'; variant: CalloutVariant; title?: string; text: string };

export interface ArticleSection {
  heading: string;
  blocks: Block[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ArticleSource {
  label: string;
  url: string;
}

export interface Article {
  slug: string;
  category: ArticleCategory;
  title: string;
  description: string;
  intro: string;
  sections: ArticleSection[];
  faqs?: FaqItem[];
  relatedSlugs?: string[];
  updated: string;
  coverImage?: string;
  ctaIntent: string;
  author?: string;
  sources?: ArticleSource[];
}

export type ArticleStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

// Admin pohľad — navyše stavové polia (redakčný workflow + poradie).
export interface AdminArticle extends Article {
  /** Verejná viditeľnosť — odvodené zo status (published <=> status='published'). */
  published: boolean;
  position: number;
  status: ArticleStatus;
  assignedEditor?: string;
  editorialNotes?: string;
  publishAt?: string;
  unpublishAt?: string;
}
