// Privacy-friendly analytika (Plausible) — cookieless, GDPR-friendly, žiadny cookie
// banner. Vypnutá, kým nie je nastavené VITE_PLAUSIBLE_SRC (URL skriptu z Plausible
// dashboardu, formát .../js/pa-XXXX.js). Bez neho sa skript neinjektuje a track()
// je no-op — nasadenie je bezpečné aj bez analytického účtu.
//
// track() no-opuje, kým nie je Plausible načítané, takže funguje aj keď skript
// vložíš priamo do index.html namiesto tohto loadera. Prepnutie na iný nástroj
// (Umami, GA4) = zmena len v tomto súbore; volania track() na CTA ostávajú.

type AnalyticsProps = Record<string, string | number | boolean>;

interface PlausibleFn {
  (event: string, options?: { props?: AnalyticsProps }): void;
  q?: unknown[];
  init?: (config?: Record<string, unknown>) => void;
  o?: Record<string, unknown>;
}

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

// Master flag: URL Plausible skriptu z dashboardu (napr. https://plausible.io/js/pa-XXXX.js).
// Doména je v novom Plausible skripte zabudovaná — samostatná env netreba.
const PLAUSIBLE_SRC = (import.meta.env.VITE_PLAUSIBLE_SRC ?? '').trim();

export function isAnalyticsEnabled(): boolean {
  return PLAUSIBLE_SRC.length > 0;
}

let loaderInjected = false;

// Injektuje Plausible skript do <head> a naštartuje meranie pageviews.
// Idempotentné — druhé volanie je no-op.
export function loadAnalyticsScript(): void {
  if (loaderInjected || !isAnalyticsEnabled() || typeof document === 'undefined') return;
  loaderInjected = true;

  // Queue stub — pageview aj eventy volané pred načítaním skriptu sa nestratia.
  window.plausible =
    window.plausible ||
    function (...args: unknown[]) {
      (window.plausible!.q = window.plausible!.q || []).push(args);
    };
  const p = window.plausible;
  p.init =
    p.init ||
    function (config?: Record<string, unknown>) {
      p.o = config || {};
    };

  const script = document.createElement('script');
  script.defer = true;
  script.src = PLAUSIBLE_SRC;
  document.head.appendChild(script);

  p.init();
}

// Zaznamená named event (goal). No-op ak Plausible nie je načítané (dev, alebo flag
// nenastavený). Nezávisí od loadera — funguje aj so snippetom vloženým do index.html.
export function track(event: string, props?: AnalyticsProps): void {
  if (typeof window === 'undefined' || typeof window.plausible !== 'function') return;
  window.plausible(event, props ? { props } : undefined);
}
