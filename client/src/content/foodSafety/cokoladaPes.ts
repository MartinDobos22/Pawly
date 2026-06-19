import type { FoodSafetyArticle } from './types';

export const cokoladaPes: FoodSafetyArticle = {
  slug: 'cokoladu',
  species: 'dog',
  foodName: 'čokoláda',
  title: 'Môže pes jesť čokoládu?',
  metaDescription:
    'Čokoláda obsahuje teobromín, ktorý je pre psov toxický. Aké množstvo je nebezpečné, aké sú príznaky otravy a kedy volať veterinára.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — čokoláda obsahuje teobromín, ktorý je pre psa toxický.',
  explanation:
    'Teobromín a kofeín (metylxantíny) v čokoláde pôsobia na srdce a nervovú sústavu psa, ktorý ich metabolizuje oveľa pomalšie ako človek. Najrizikovejšia je horká čokoláda a kakaový prášok, najmenej riziková je biela čokoláda. Príznaky (vracanie, hnačka, nepokoj, zrýchlený tep) sa objavujú do 6–12 hodín, pri vyšších dávkach hrozia kŕče.',
  alternatives: ['špeciálne psie pamlsky', 'kúsok jablka bez jadierok', 'banán'],
  sources: [
    {
      label: 'Merck Veterinary Manual — Chocolate Toxicosis in Animals',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
    },
    {
      label: 'VCA Animal Hospitals — Chocolate Poisoning in Dogs',
      url: 'https://vcahospitals.com/know-your-pet/chocolate-poisoning-in-dogs',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: [
    '/moze-macka-jest-cokoladu',
    '/rady/pes-zjedol-nieco-toxicke',
    '/rady/ako-rozpoznat-otravu-u-psa',
  ],
};
