import type { FoodSafetyArticle } from './types';

export const cokoladaMacka: FoodSafetyArticle = {
  slug: 'cokoladu',
  species: 'cat',
  foodName: 'čokoláda',
  title: 'Môže mačka jesť čokoládu?',
  metaDescription:
    'Mačky čokoládu zvyčajne neobľubujú, ale ak ju zjedia, sú na teobromín citlivejšie ako psy. Príznaky a kedy volať veterinára.',
  verdict: 'UNSAFE',
  shortAnswer: 'Nie — aj malé množstvo čokolády je pre mačku riziko.',
  explanation:
    'Mačky chuťovo čokoládu väčšinou nevyhľadávajú, takže k otrave dochádza menej často ako u psov, ale na metylxantíny (teobromín, kofeín) sú v prepočte na kilogram citlivejšie. Mierne príznaky (zvýšený pocit smädu, vracanie, hnačka) sa môžu vyvinúť do nepokoja, zrýchleného tepu, triašky až kŕčov pri vyšších dávkach. Pri akomkoľvek podozrení na zjedenie čokolády kontaktuj veterinára hneď, nečakaj na príznaky.',
  alternatives: ['mačacie pamlsky', 'čerstvá voda'],
  sources: [
    {
      label: 'Merck Veterinary Manual — Chocolate Toxicosis in Animals',
      url: 'https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
    },
    {
      label: 'ASPCA — What to Do If Your Pet Gets into Chocolate',
      url: 'https://www.aspca.org/news/what-do-if-your-pet-gets-chocolate',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/moze-macka-jest-cibulu', '/rady/pes-zjedol-nieco-toxicke'],
};
