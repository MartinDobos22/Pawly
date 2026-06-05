import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import skCommon from '../locales/sk/common.json';
import skAnalyze from '../locales/sk/analyze.json';
import skHealthPassport from '../locales/sk/healthPassport.json';
import skEpisodes from '../locales/sk/episodes.json';
import skVetCard from '../locales/sk/vetCard.json';
import skAuth from '../locales/sk/auth.json';
import skLanding from '../locales/sk/landing.json';
import skInstall from '../locales/sk/install.json';

import enCommon from '../locales/en/common.json';
import enAnalyze from '../locales/en/analyze.json';
import enHealthPassport from '../locales/en/healthPassport.json';
import enEpisodes from '../locales/en/episodes.json';
import enVetCard from '../locales/en/vetCard.json';
import enAuth from '../locales/en/auth.json';
import enLanding from '../locales/en/landing.json';
import enInstall from '../locales/en/install.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'sk',
    supportedLngs: ['sk', 'en'],
    defaultNS: 'common',
    ns: ['common', 'analyze', 'healthPassport', 'episodes', 'vetCard', 'auth', 'landing', 'install'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'granule-check-language',
      caches: ['localStorage'],
    },
    resources: {
      sk: {
        common: skCommon,
        analyze: skAnalyze,
        healthPassport: skHealthPassport,
        episodes: skEpisodes,
        vetCard: skVetCard,
        auth: skAuth,
        landing: skLanding,
        install: skInstall,
      },
      en: {
        common: enCommon,
        analyze: enAnalyze,
        healthPassport: enHealthPassport,
        episodes: enEpisodes,
        vetCard: enVetCard,
        auth: enAuth,
        landing: enLanding,
        install: enInstall,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
