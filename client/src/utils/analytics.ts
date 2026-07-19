// Privacy-friendly analytika (Plausible) — cookieless, GDPR-friendly, žiadny cookie
// banner. Vypnutá, kým nie je nastavené VITE_PLAUSIBLE_DOMAIN. Bez neho sa skript
// neinjektuje a track() je no-op — nasadenie je bezpečné aj bez analytického účtu.
//
// Prepnutie na iný nástroj (Umami, GA4) = zmena len v tomto súbore; volania track()
// na jednotlivých CTA ostávajú nezmenené.

type AnalyticsProps = Record<string, string | number | boolean>;

interface PlausibleFn {
  (event: string, options?: { props?: AnalyticsProps }): void;
  q?: unknown[];
}

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

const PLAUSIBLE_DOMAIN = (import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? '').trim();
const PLAUSIBLE_SRC = (
  import.meta.env.VITE_PLAUSIBLE_SRC ?? 'https://plausible.io/js/script.js'
).trim();

export function isAnalyticsEnabled(): boolean {
  return PLAUSIBLE_DOMAIN.length > 0;
}

let loaderInjected = false;

// Injektuje Plausible skript do <head>. Idempotentné — druhé volanie je no-op.
export function loadAnalyticsScript(): void {
  if (loaderInjected || !isAnalyticsEnabled() || typeof document === 'undefined') return;
  loaderInjected = true;

  // Queue stub — event zaznamenaný cez track() pred načítaním skriptu sa nestratí.
  window.plausible =
    window.plausible ||
    function (...args: unknown[]) {
      (window.plausible!.q = window.plausible!.q || []).push(args);
    };

  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  script.src = PLAUSIBLE_SRC;
  document.head.appendChild(script);
}

// Zaznamená named event (goal). No-op ak analytika nie je zapnutá alebo beží na serveri.
export function track(event: string, props?: AnalyticsProps): void {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') return;
  window.plausible?.(event, props ? { props } : undefined);
}
