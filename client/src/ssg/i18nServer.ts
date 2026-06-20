import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { namespaces, resources } from '../i18n';

// Synchrónna i18n inštancia pre build-time prerender (react-dom/server).
// initAsync: false → init je synchronný, takže t() v renderToString vráti
// preklady (singleton i18n má init async, čo by v SSR vrátilo kľúče namiesto textu).
const ssgI18n = i18n.createInstance();

ssgI18n.use(initReactI18next).init({
  lng: 'sk',
  fallbackLng: 'sk',
  supportedLngs: ['sk', 'en'],
  defaultNS: 'common',
  ns: namespaces,
  resources,
  initAsync: false,
  interpolation: { escapeValue: false },
});

export default ssgI18n;
