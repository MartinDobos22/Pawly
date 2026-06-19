import type { GuideArticle } from './types';

export const pesZjedolNiecoToxicke: GuideArticle = {
  slug: 'pes-zjedol-nieco-toxicke',
  species: 'dog',
  title: 'Čo robiť, keď pes zjedol niečo toxické',
  metaDescription:
    'Postup krok za krokom, keď pes zjedol potenciálne toxickú látku — čo robiť hneď, čo nikdy nerobiť a kedy a kam volať.',
  intro:
    'Rýchla a správna reakcia v prvých minútach môže výrazne ovplyvniť výsledok. Toto je všeobecný postup — pri konkrétnej látke sa riaď aj odporúčaniami pre danú potravinu či látku a vždy kontaktuj odborníka.',
  steps: [
    {
      heading: '1. Zachovaj kľud a zabezpeč zvieratko',
      body: 'Odveď psa od zdroja látky do bezpečného, kľudného priestoru, aby nezjedol viac.',
    },
    {
      heading: '2. Zisti čo, koľko a kedy',
      body: 'Skús zistiť presný názov látky (napr. odfoť obal/zloženie), odhadnúť zjedené množstvo a čas od zjedenia — tieto údaje budú potrebné pri telefonáte.',
    },
    {
      heading: '3. Nevyvolávaj zvracanie sám',
      body: 'Bez výslovného odporúčania veterinára alebo poradne pre otravy zvracanie nevyvolávaj — pri niektorých látkach (napr. žieravých) to môže stav zhoršiť.',
    },
    {
      heading: '4. Zavolaj veterinára alebo poradňu pre otravy zvierat',
      body: 'ASPCA Animal Poison Control Center je americká poradňa dostupná 24/7 na telefónnom čísle +1 (888) 426-4435 (konzultácia je spravidla platená), alternatívou je Pet Poison Helpline na +1 855-764-7661. V SR/ČR kontaktuj predovšetkým svojho veterinára alebo najbližšiu veterinárnu pohotovosť.',
    },
    {
      heading: '5. Priprav sa na prevoz k veterinárovi',
      body: 'Vezmi s sebou obal alebo zvyšok látky, ak je to možné — pomôže to pri určení ďalšieho postupu.',
    },
  ],
  warnings: [
    'Nikdy nepodávaj soľ, mlieko ani domáce „protijedy" — nie sú overené a môžu stav zhoršiť',
    'Pri kŕčoch, bezvedomí alebo ťažkostiach s dýchaním vyhľadaj pohotovosť okamžite',
  ],
  sources: [
    {
      label: 'ASPCA Animal Poison Control Center',
      url: 'https://www.aspca.org/pet-care/aspca-poison-control',
    },
    {
      label: 'ASPCA — What to Expect When Calling ASPCA Animal Poison Control Center',
      url: 'https://www.aspca.org/news/what-expect-when-calling-aspca-animal-poison-control-center',
    },
    {
      label: 'Pet Poison Helpline',
      url: 'https://www.petpoisonhelpline.com/',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: [
    '/rady/ako-rozpoznat-otravu-u-psa',
    '/moze-pes-jest-cesnak',
    '/moze-pes-jest-cokoladu',
  ],
};
