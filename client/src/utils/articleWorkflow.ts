import type { ArticleStatus } from '../content/poradna/types';

// Zrkadlo serverovej mapy (server/src/services/articleService.ts). Drift pravidlo:
// pri zmene uprav obe strany.
export const ARTICLE_STATUS_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  draft: ['in_review', 'archived'],
  in_review: ['draft', 'approved'],
  approved: ['published', 'scheduled', 'draft'],
  scheduled: ['published', 'draft'],
  published: ['archived', 'draft'],
  archived: ['draft'],
};

export const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'Koncept',
  in_review: 'Na kontrolu',
  approved: 'Schválené',
  scheduled: 'Naplánované',
  published: 'Publikované',
  archived: 'Archivované',
};

export const STATUS_COLORS: Record<ArticleStatus, 'default' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  in_review: 'warning',
  approved: 'info',
  scheduled: 'info',
  published: 'success',
  archived: 'default',
};

// Label akcie pre prechod do daného cieľového stavu (z aktuálneho stavu).
export function transitionActionLabel(from: ArticleStatus, to: ArticleStatus): string {
  if (to === 'draft') return from === 'archived' ? 'Obnoviť ako koncept' : 'Vrátiť do konceptu';
  switch (to) {
    case 'in_review':
      return 'Poslať na kontrolu';
    case 'approved':
      return 'Schváliť';
    case 'scheduled':
      return 'Naplánovať';
    case 'published':
      return 'Publikovať';
    case 'archived':
      return 'Archivovať';
    default:
      return STATUS_LABELS[to];
  }
}
