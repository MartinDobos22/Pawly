import type { FoodSafetyArticle } from './types';

export const hroznoPes: FoodSafetyArticle = {
  slug: 'hrozno',
  species: 'dog',
  foodName: 'hrozno a hrozienka',
  title: 'Môže pes jesť hrozno alebo hrozienka?',
  metaDescription:
    'Hrozno a hrozienka môžu u psa spôsobiť akútne zlyhanie obličiek, aj v malom množstve. Prečo je to nebezpečné a čo robiť po zjedení.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — hrozno aj hrozienka môžu spôsobiť akútne zlyhanie obličiek.',
  explanation:
    'Presný toxín ani bezpečná dávka nie sú známe — citlivosť sa medzi psami výrazne líši a u niektorých postačí len pár bobúľ. Skoré príznaky (vracanie, nechutenstvo, hnačka, apatia) sa objavujú do 12–24 hodín, poškodenie obličiek (zvýšené pitie a močenie, neskôr žiadne močenie) do 24–48 hodín. Čím skôr sa začne liečba — ešte pred objavením príznakov — tým je prognóza lepšia.',
  alternatives: ['čučoriedky', 'jablko bez jadierok', 'banán'],
  sources: [
    {
      label: 'VCA Animal Hospitals — Grape, Raisin, and Currant Poisoning in Dogs',
      url: 'https://vcahospitals.com/know-your-pet/grape-raisin-and-currant-poisoning-in-dogs',
    },
    {
      label: 'Merck Veterinary Manual — Grape, Raisin, and Tamarind Toxicosis in Dogs',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/grape-raisin-and-tamarind-vitis-spp-tamarindus-spp-toxicosis-in-dogs',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/rady/pes-zjedol-nieco-toxicke', '/rady/ako-rozpoznat-otravu-u-psa'],
};
