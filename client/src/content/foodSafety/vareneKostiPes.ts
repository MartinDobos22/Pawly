import type { FoodSafetyArticle } from './types';

export const vareneKostiPes: FoodSafetyArticle = {
  slug: 'varene-kosti',
  species: 'dog',
  foodName: 'varené kosti',
  title: 'Môže pes jesť varené kosti?',
  metaDescription:
    'Varené kosti sa pri hryzení štiepia na ostré kúsky a môžu poraniť tráviaci trakt aj zlomiť zub. Prečo veterinári varené kosti nedoporúčajú.',
  verdict: 'CAUTION',
  shortAnswer: 'Neodporúča sa — varené kosti sa ľahko štiepia na ostré úlomky.',
  explanation:
    'Varené kosti sú krehkejšie ako surové a pri hryzení sa štiepia na ostré úlomky, ktoré môžu poraniť ústa, prerezať stenu žalúdka či čriev, alebo spôsobiť zalomenie čeľusti. Veľké zuby sa navyše môžu o tvrdú kosť zlomiť. Riziko sa týka kostí v akejkoľvek forme — surové kosti zase nesú riziko bakteriálnej kontaminácie (salmonela, E. coli).',
  warnings: [
    'Nikdy nedávaj kosti z hydiny ani rybie kosti — ľahko sa štiepia',
    'Pri podozrení na zalomenú kosť alebo krv v stolici vyhľadaj veterinára okamžite',
  ],
  sources: [
    {
      label: 'VCA Animal Hospitals — Why Bones Are Not Safe for Dogs',
      url: 'https://vcahospitals.com/know-your-pet/why-bones-are-not-safe-for-dogs',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/moze-pes-jest-avokado', '/rady/pes-zjedol-nieco-toxicke'],
};
