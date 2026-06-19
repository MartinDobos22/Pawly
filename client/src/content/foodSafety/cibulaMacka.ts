import type { FoodSafetyArticle } from './types';

export const cibulaMacka: FoodSafetyArticle = {
  slug: 'cibulu',
  species: 'cat',
  foodName: 'cibuľa',
  title: 'Môže mačka jesť cibuľu?',
  metaDescription:
    'Mačky sú na cibuľu citlivejšie ako psy — aj malé množstvo môže poškodiť červené krvinky. Prečo je to nebezpečné a aké sú príznaky.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — mačky sú na cibuľu ešte citlivejšie ako psy.',
  explanation:
    'Sírne zlúčeniny v cibuli (a celej čeľadi Allium — cesnak, pór, pažítka) oxidačne poškodzujú červené krvinky mačky, čo vedie k tzv. Heinzovým telieskam a hemolytickej anémii. Mačky sú na túto toxicitu citlivejšie než psy aj pri menšom množstve. Najrizikovejšie sú koncentrované formy — sušená, prášková cibuľa či cibuľová polievková zmes — ale toxické je aj surové a varené. Príznaky anémie (slabosť, bledé sliznice) sa môžu prejaviť až o 3–5 dní neskôr.',
  alternatives: ['varené kuracie mäso bez korenia', 'mačacie pamlsky'],
  sources: [
    {
      label: 'Merck Veterinary Manual — Garlic and Onion (Allium spp) Toxicosis in Animals',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/garlic-and-onion-allium-spp-toxicosis-in-animals',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/moze-pes-jest-cibulu', '/moze-macka-jest-cokoladu'],
};
