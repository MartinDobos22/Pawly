// Google AdSense feature flag + loader.
// Celá reklamná vrstva je vypnutá, kým nie je nastavené VITE_ADSENSE_CLIENT
// (formát "ca-pub-XXXXXXXXXXXXXXXX"). Bez neho sa loader neinjektuje a AdUnit nič
// nevykreslí — nasadenie je tak bezpečné aj pred schválením AdSense.

export const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT ?? '').trim();

export function isAdsenseEnabled(): boolean {
  return ADSENSE_CLIENT.startsWith('ca-pub-');
}

let loaderInjected = false;

// Injektuje adsbygoogle.js do <head>. Idempotentné — druhé volanie je no-op.
export function loadAdsenseScript(): void {
  if (loaderInjected || !isAdsenseEnabled() || typeof document === 'undefined') return;
  loaderInjected = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}
