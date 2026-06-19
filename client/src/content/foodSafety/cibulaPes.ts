import type { FoodSafetyArticle } from './types';

export const cibulaPes: FoodSafetyArticle = {
  slug: 'cibulu',
  species: 'dog',
  foodName: 'cibuľa',
  title: 'Môže pes jesť cibuľu?',
  metaDescription:
    'Cibuľa je pre psov toxická — spôsobuje oxidačné poškodenie červených krviniek. Aké množstvo je rizikové, aké sú príznaky a čo robiť.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — cibuľa (surová, varená aj sušená) je pre psa toxická.',
  explanation:
    'Sírne zlúčeniny v cibuli oxidačne poškodzujú červené krvinky, čo môže vyústiť do hemolytickej anémie. Rizikové je už množstvo okolo 15–30 g cibule na kg telesnej hmotnosti, najcitlivejšie sú niektoré ázijské plemená (napr. akita, šiba inu). Skoré príznaky sú tráviace (vracanie, slinenie, bolesť brucha), príznaky anémie (slabosť, bledosť, zrýchlený tep) môžu prísť s odstupom dní.',
  alternatives: ['varené mäso bez korenia', 'tekvica', 'mrkva'],
  sources: [
    {
      label: 'Pet Poison Helpline — Onions Are Toxic To Dogs',
      url: 'https://www.petpoisonhelpline.com/poison/onion/',
    },
    {
      label: 'Merck Veterinary Manual — Garlic and Onion (Allium spp) Toxicosis in Animals',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/garlic-and-onion-allium-spp-toxicosis-in-animals',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: [
    '/moze-pes-jest-cesnak',
    '/moze-macka-jest-cibulu',
    '/rady/pes-zjedol-nieco-toxicke',
  ],
};
