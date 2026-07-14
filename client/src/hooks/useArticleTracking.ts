import { useEffect } from 'react';
import { trackArticleEvent } from '../services/analyticsApi';
import { shouldSendOncePerDay } from '../utils/articleViewDedup';

// Sleduje zobrazenie a hĺbku scrollu pre daný článok. View/scroll sa počítajú
// ako unikátny čitateľ za deň (dedup cez localStorage) — refresh, opätovné
// otvorenie aj StrictMode dvojité mountnutie posielajú event len raz.
// Best-effort.
export function useArticleTracking(slug: string | undefined): void {
  useEffect(() => {
    if (!slug) return;

    if (shouldSendOncePerDay(slug, 'view')) trackArticleEvent(slug, 'view');

    let sent50 = false;
    let sent90 = false;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const ratio = (window.scrollY || doc.scrollTop) / scrollable;
      if (!sent50 && ratio >= 0.5) {
        sent50 = true;
        if (shouldSendOncePerDay(slug, 'scroll_50')) trackArticleEvent(slug, 'scroll_50');
      }
      if (!sent90 && ratio >= 0.9) {
        sent90 = true;
        if (shouldSendOncePerDay(slug, 'scroll_90')) trackArticleEvent(slug, 'scroll_90');
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);
}
