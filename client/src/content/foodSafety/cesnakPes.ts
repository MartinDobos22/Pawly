import type { FoodSafetyArticle } from './types';

export const cesnakPes: FoodSafetyArticle = {
  slug: 'cesnak',
  species: 'dog',
  foodName: 'cesnak',
  title: 'Môže pes jesť cesnak?',
  metaDescription:
    'Cesnak je pre psov toxický aj v malom množstve — poškodzuje červené krvinky a môže spôsobiť anémiu. Vysvetlenie, príznaky a bezpečné alternatívy.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — cesnak je pre psa toxický, a to v surovej, varenej aj sušenej forme.',
  explanation:
    'Cesnak obsahuje organosulfidové zlúčeniny (tiosulfáty), ktoré poškodzujú červené krvinky a spôsobujú tzv. Heinzove telieska a hemolytickú anémiu. Je približne 3–5-krát toxickejší ako cibuľa na rovnakú hmotnosť, takže aj malé množstvo (napr. strúčik v jedle) môže predstavovať riziko, najmä pri opakovanom podávaní. Príznaky anémie (slabosť, bledé sliznice, zrýchlený dych) sa často objavia až s odstupom niekoľkých dní od zjedenia, nie hneď.',
  alternatives: ['varené kuracie alebo hovädzie mäso bez korenia', 'mrkva', 'tekvica'],
  sources: [
    {
      label: 'ASPCA Animal Poison Control — Garlic',
      url: 'https://www.aspca.org/pet-care/aspca-poison-control/toxic-and-non-toxic-plants/garlic',
    },
    {
      label: 'Merck Veterinary Manual — Garlic and Onion (Allium spp) Toxicosis in Animals',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/garlic-and-onion-allium-spp-toxicosis-in-animals',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/moze-pes-jest-cibulu', '/rady/pes-zjedol-nieco-toxicke'],
};
