import type { FoodSafetyArticle } from './types';

export const xylitolPes: FoodSafetyArticle = {
  slug: 'xylitol',
  species: 'dog',
  foodName: 'xylitol',
  title: 'Môže pes jesť xylitol (sladidlo)?',
  metaDescription:
    'Xylitol — náhradné sladidlo v žuvačkách, cukrovinkách aj arašidovom masle — je pre psov vysoko toxický. Spôsobuje pokles cukru v krvi a môže poškodiť pečeň.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — xylitol je pre psa vysoko toxický.',
  explanation:
    'Xylitol u psa spustí rýchle vyplavenie inzulínu, čo vedie k prudkému poklesu cukru v krvi do 30–60 minút od zjedenia. Pri vyšších dávkach hrozí aj zlyhanie pečene. Nájdeš ho v žuvačkách bez cukru, cukrovinkách, niektorých pečených dobrotách, arašidovom masle aj v zubných pastách — vždy skontroluj zloženie.',
  alternatives: ['psie pamlsky', 'kúsok mrkvy', 'čerstvá voda'],
  sources: [
    {
      label: 'Merck Veterinary Manual — Xylitol Toxicosis in Dogs',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/xylitol-toxicosis-in-dogs',
    },
    {
      label: 'VCA Animal Hospitals — Xylitol Poisoning in Dogs',
      url: 'https://vcahospitals.com/know-your-pet/xylitol-toxicity-in-dogs',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/rady/pes-zjedol-nieco-toxicke', '/rady/ako-rozpoznat-otravu-u-psa'],
};
