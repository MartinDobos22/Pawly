import type { GuideArticle } from './types';

export const akoOdcervitPsa: GuideArticle = {
  slug: 'ako-odcervit-psa',
  species: 'dog',
  title: 'Ako bezpečne odčerviť psa',
  metaDescription:
    'Kedy a ako často odčervovať šteňa a dospelého psa podľa odporúčaní ESCCAP. Praktický postup a na čo si dať pozor.',
  intro:
    'Odčervenie je rutinná, ale dôležitá súčasť starostlivosti — väčšina parazitov nemá viditeľné príznaky, kým infekcia výrazne nepokročí. Frekvencia by mala vychádzať z veku, životného štýlu a rizikových faktorov psa, ideálne po konzultácii s veterinárom.',
  steps: [
    {
      heading: '1. Šteňatá — začni skoro a často',
      body: 'Prvé odčervenie sa podľa ESCCAP odporúča už 14. deň po narodení, potom každé 2 týždne až do 2 týždňov po odstavení od matky.',
    },
    {
      heading: '2. Po odstavení — mesačne do 6 mesiacov',
      body: 'Pri zvýšenom riziku (kontakt s ďalšími psami, voľný pohyb v prírode, surové kŕmenie) pokračuj v mesačných intervaloch až do veku 6 mesiacov.',
    },
    {
      heading: '3. Dospelý pes — individuálny plán',
      body: 'Frekvencia u dospelých psov sa určuje podľa životného štýlu (poľovné psy, prístup k voľnej prírode, surová strava) a lokálnych rizík — nie je jedno univerzálne pravidlo pre všetky psy. Konzultuj s veterinárom optimálny interval pre tvojho psa.',
    },
    {
      heading: '4. Vyber prípravok podľa spektra parazitov',
      body: 'Rôzne prípravky pôsobia na rôzne druhy parazitov (okrúhle červy, pásomnice, srdcové červy). Veterinár odporučí prípravok podľa regiónu a rizikového profilu psa, prípadne podľa výsledku vyšetrenia trusu.',
    },
    {
      heading: '5. Sleduj a zaznamenávaj',
      body: 'Veď si záznam o dátume a použitom prípravku — pomôže to dodržať intervaly a je to užitočná informácia pre veterinára pri ďalšej návšteve.',
    },
  ],
  warnings: [
    'Odčervenie vždy konzultuj s veterinárom — dávkovanie závisí od váhy a zdravotného stavu psa',
  ],
  sources: [
    {
      label: 'ESCCAP — Guideline GL1: Worm Control in Dogs and Cats',
      url: 'https://www.esccap.org/guidelines/gl1/',
    },
    {
      label: 'ESCCAP — Scheme for individual deworming of dogs',
      url: 'https://www.esccap.org/deworming-dogs/',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/rady/ako-rozpoznat-otravu-u-psa'],
};
