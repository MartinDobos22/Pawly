import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './i18n/index';
import './i18n/types';
import App from './App';
import { isAdsenseEnabled, loadAdsenseScript } from './utils/adsense';
import { isAnalyticsEnabled, loadAnalyticsScript } from './utils/analytics';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Reklamy načítaj len v produkcii a len keď je nastavené VITE_ADSENSE_CLIENT.
if (import.meta.env.PROD && isAdsenseEnabled()) {
  loadAdsenseScript();
}

// Analytika len v produkcii a len keď je nastavené VITE_PLAUSIBLE_DOMAIN.
if (import.meta.env.PROD && isAnalyticsEnabled()) {
  loadAnalyticsScript();
}
