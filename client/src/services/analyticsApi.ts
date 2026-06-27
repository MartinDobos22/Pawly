import type { ArticleEventType } from '../content/poradna/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Verejný tracking — bez auth, fire-and-forget. Chyby ticho ignorujeme, aby
// analytika nikdy nerušila čítanie článku. keepalive prežije aj navigáciu preč.
export function trackArticleEvent(
  articleSlug: string,
  eventType: ArticleEventType,
  metadata?: Record<string, unknown>
): void {
  try {
    void fetch(`${BASE_URL}/api/analytics/article-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleSlug, eventType, metadata }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking je best-effort */
  }
}
