// Verzovanie článkov — server-side typy. Drift pravidlo: zrkadlo na klientovi
// v client/src/content/poradna/types.ts.
import type { AdminArticle } from './article';

export type ArticleVersionKind = 'manual' | 'autosave' | 'publish' | 'restore';

export interface ArticleVersionMeta {
  id: string;
  versionNumber: number;
  kind: ArticleVersionKind;
  changeSummary: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface ArticleVersion extends ArticleVersionMeta {
  data: AdminArticle;
}
