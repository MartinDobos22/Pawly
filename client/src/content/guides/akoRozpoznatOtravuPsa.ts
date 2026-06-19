import type { GuideArticle } from './types';

export const akoRozpoznatOtravuPsa: GuideArticle = {
  slug: 'ako-rozpoznat-otravu-u-psa',
  species: 'dog',
  title: 'Ako rozpoznať príznaky otravy u psa',
  metaDescription:
    'Najčastejšie príznaky otravy u psa pri rôznych typoch toxínov a kedy ide o stav vyžadujúci okamžitú veterinárnu pomoc.',
  intro:
    'Príznaky otravy sa výrazne líšia podľa toxínu, ale niektoré varovné signály sa opakujú pri väčšine látok. Ak máš podozrenie na otravu, čas hraje rolu — nečakaj, či príznaky „samé prejdú".',
  steps: [
    {
      heading: '1. Tráviace príznaky',
      body: 'Vracanie, hnačka, slinenie a bolesť brucha sú časté pri mnohých toxínoch (napr. hrozno, cibuľa, skazené jedlo) a väčšinou prichádzajú prvé, do 6–12 hodín od kontaktu.',
    },
    {
      heading: '2. Neurologické príznaky',
      body: 'Triaška, neistá chôdza (ataxia), nepokoj alebo naopak útlm, a v závažných prípadoch kŕče či kóma signalizujú zásah nervovej sústavy — ide o stav vyžadujúci okamžitý zásah.',
    },
    {
      heading: '3. Príznaky na srdci a dýchaní',
      body: 'Zrýchlený alebo nepravidelný tep, zrýchlené dýchanie alebo namáhavé dýchanie môžu signalizovať pôsobenie na kardiovaskulárny systém (napr. pri čokoláde).',
    },
    {
      heading: '4. Oneskorené príznaky',
      body: 'Pri niektorých toxínoch (napr. hrozno, cibuľa) sa najzávažnejšie príznaky — zlyhanie obličiek, anémia — objavia až o 1–5 dní neskôr. Sleduj psa aj keď sa krátko po zjedení javí v poriadku.',
    },
    {
      heading: '5. Kedy ide o pohotovosť',
      body: 'Kŕče, bezvedomie, ťažkosti s dýchaním, opakované vracanie alebo podozrenie na vyššie uvedené potraviny a látky sú dôvod na okamžitý kontakt s veterinárom — nie na čakanie do rána.',
    },
  ],
  sources: [
    {
      label: 'Merck Veterinary Manual — Food Hazards (Poisoning overview)',
      url: 'https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/rady/pes-zjedol-nieco-toxicke', '/moze-pes-jest-hrozno'],
};
