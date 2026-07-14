import type { ArticleEventType } from '../content/poradna/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
// Neutrálna cesta zámerne (nie „/analytics") — adblock filtre blokujú URL
// obsahujúce „analytics" a tichým dropom by podhodnocovali metriky.
const EVENT_URL = `${BASE_URL}/api/events/article-event`;

function sendWithRetry(payload: string, retriesLeft: number): void {
  fetch(EVENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  })
    .then((res) => {
      // 4xx (validácia, rate limit) sa opakovaním nevyrieši — retry len 5xx.
      if (res.status >= 500 && retriesLeft > 0) sendWithRetry(payload, retriesLeft - 1);
    })
    .catch(() => {
      if (retriesLeft > 0) sendWithRetry(payload, retriesLeft - 1);
    });
}

// Verejný tracking — bez auth, best-effort. sendBeacon prežije aj navigáciu preč
// a nezdržuje uvoľnenie stránky; fetch je fallback s jedným opakovaním.
export function trackArticleEvent(
  articleSlug: string,
  eventType: ArticleEventType,
  metadata?: Record<string, unknown>
): void {
  const payload = JSON.stringify({ articleSlug, eventType, metadata });
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon(EVENT_URL, blob)) return;
    }
  } catch {
    /* padne do fetch fallbacku */
  }
  try {
    sendWithRetry(payload, 1);
  } catch {
    /* tracking je best-effort */
  }
}
