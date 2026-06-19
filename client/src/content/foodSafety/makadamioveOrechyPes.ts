import type { FoodSafetyArticle } from './types';

export const makadamioveOrechyPes: FoodSafetyArticle = {
  slug: 'makadamiove-orechy',
  species: 'dog',
  foodName: 'makadamiové orechy',
  title: 'Môže pes jesť makadamiové orechy?',
  metaDescription:
    'Makadamiové orechy spôsobujú psom svalovú slabosť a triašku. Aké množstvo je rizikové a ako dlho príznaky trvajú.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — makadamiové orechy psovi spôsobia slabosť, triašku a horúčku.',
  explanation:
    'Presný mechanizmus toxicity nie je úplne objasnený, ale psy sú jediný druh, u ktorého boli klinické príznaky opakovane zdokumentované. Do 12 hodín od zjedenia sa môže objaviť slabosť (najmä zadných končatín), triaška, neistá chôdza a zvýšená telesná teplota. Príznaky bývajú prechodné a väčšinou odznejú do 12–48 hodín, no veterinárnu kontrolu treba vyhľadať vždy.',
  alternatives: ['kúsok jablka', 'mrkva'],
  sources: [
    {
      label: 'Merck Veterinary Manual — Macadamia Nut Toxicosis in Dogs',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/macadamia-nut-toxicosis-in-dogs',
    },
    {
      label: 'ASPCA Animal Poison Control — Macadamia Nut',
      url: 'https://www.aspca.org/pet-care/aspca-poison-control/toxic-and-non-toxic-plants/macadamia-nut',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/rady/pes-zjedol-nieco-toxicke', '/rady/ako-rozpoznat-otravu-u-psa'],
};
