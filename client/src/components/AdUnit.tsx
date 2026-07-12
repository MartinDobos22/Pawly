import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { ADSENSE_CLIENT, isAdsenseEnabled } from '../utils/adsense';

// Slot ID konkrétnej reklamnej jednotky (AdSense → Ads → By ad unit → Display ads).
// Ak nie je nastavený, jednotka sa nevykreslí (aj keď je AdSense inak zapnutý).
const ARTICLE_SLOT = (import.meta.env.VITE_ADSENSE_SLOT_ARTICLE ?? '').trim();

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface Props {
  /** AdSense ad unit slot ID. Default = VITE_ADSENSE_SLOT_ARTICLE. */
  slot?: string;
  format?: string;
}

export default function AdUnit({ slot = ARTICLE_SLOT, format = 'auto' }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!isAdsenseEnabled() || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Skript ešte nie je načítaný alebo je blokovaný adblockom — ticho ignoruj.
    }
  }, [slot]);

  if (!isAdsenseEnabled() || !slot) return null;

  return (
    <Box sx={{ my: 4, textAlign: 'center', '@media print': { display: 'none' } }} aria-hidden>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </Box>
  );
}
