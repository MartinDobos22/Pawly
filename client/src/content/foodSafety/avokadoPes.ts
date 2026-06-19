import type { FoodSafetyArticle } from './types';

export const avokadoPes: FoodSafetyArticle = {
  slug: 'avokado',
  species: 'dog',
  foodName: 'avokádo',
  title: 'Môže pes jesť avokádo?',
  metaDescription:
    'Avokádo je pre psy menej rizikové ako pre vtáky, ale stále hrozí tráviace ťažkosti, zápal pankreasu a riziko upchatia črevami pri zjedení kôstky.',
  verdict: 'CAUTION',
  shortAnswer: 'V malom množstve dužiny áno, ale s opatrnosťou — kôstka a šupka sú riziko.',
  explanation:
    'Látka persín v avokáde je vysoko toxická pre vtáky, kone či hlodavce, no psy sú na ňu relatívne odolné — zdokumentovaný je len ojedinelý prípad poškodenia srdca. Bežnejšie riziko pri psoch je tráviace zaťaženie z vysokého obsahu tuku (možný zápal pankreasu pri väčšom množstve) a najmä kôstka, ktorá môže upchať tráviaci trakt.',
  warnings: [
    'Kôstku a šupku nikdy nedávaj — riziko upchatia čriev',
    'Pri väčšom množstve hrozí zápal pankreasu pre vysoký obsah tuku',
  ],
  sources: [
    {
      label: 'Merck Veterinary Manual — Avocado (Persea spp) Toxicosis in Animals',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/avocado-persea-spp-toxicosis-in-animals',
    },
    {
      label: 'ASPCA — The Scoop on Avocado and Your Pets',
      url: 'https://www.aspca.org/news/scoop-avocado-and-your-pets',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/moze-pes-jest-varene-kosti'],
};
