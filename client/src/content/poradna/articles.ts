import type { Article, ArticleCategory } from './types';

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  krmivo: 'Krmivo a výživa',
  zdravie: 'Zdravie a prevencia',
};

export const CATEGORY_COLORS: Record<ArticleCategory, 'success' | 'info'> = {
  krmivo: 'success',
  zdravie: 'info',
};

export const articles: Article[] = [
  {
    slug: 'ako-citat-zlozenie-psieho-krmiva',
    category: 'krmivo',
    title: 'Ako čítať zloženie psieho krmiva',
    description:
      'Návod, ako sa zorientovať v zložení granúl: poradie zložiek, zdroj bielkovín, obilniny a konzervanty. Na čo si dať pozor pri výbere krmiva pre psa.',
    intro:
      'Zloženie na obale krmiva povie o jeho kvalite viac než marketingové heslá na prednej strane. Keď vieš, čo hľadať, dokážeš za pár sekúnd posúdiť, či krmivo psovi sedí.',
    updated: '2026-06-21',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Poradie zložiek rozhoduje',
        paragraphs: [
          'Zložky sa uvádzajú zostupne podľa hmotnosti. To, čo je na prvom mieste, tvorí najväčší podiel krmiva. Ideálne je, keď je na začiatku konkrétny zdroj mäsa (napr. „kuracie mäso 30 %") a nie všeobecné „mäso a živočíšne produkty".',
          'Pozor na „rozdeľovanie" obilnín na viac položiek (napr. kukurica, kukuričný glutén, kukuričná múka) — jednotlivo sa zdajú malé, no spolu môžu prevažovať nad mäsom.',
        ],
      },
      {
        heading: 'Zdroj a podiel bielkovín',
        paragraphs: [
          'Hľadaj konkrétny druh mäsa a jeho percento. Čím konkrétnejší údaj, tým lepšie. „Dehydrované kuracie mäso" je koncentrovanejší zdroj bielkovín než čerstvé mäso, ktoré obsahuje veľa vody.',
          'Ak má pes známu alergiu, skontroluj, či krmivo neobsahuje práve daný zdroj bielkovín — aj v malom množstve.',
        ],
      },
      {
        heading: 'Obilniny, konzervanty a dochucovadlá',
        paragraphs: [
          'Obilniny samy o sebe nie sú problém, ale ich vysoký podiel pri citlivom trávení môže škodiť. Sleduj aj umelé farbivá a dochucovadlá — kvalitné krmivo ich spravidla nepotrebuje.',
          'Pri konzervantoch uprednostni prirodzené (napr. tokoferoly/vitamín E) pred chemickými.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Je krmivo bez obilnín vždy lepšie?',
        a: 'Nie nutne. „Grain-free" je vhodné pri intolerancii obilnín, ale pre väčšinu psov nie je nevyhnutné. Dôležitejší je celkový pomer a kvalita zložiek.',
      },
      {
        q: 'Ako rýchlo viem posúdiť zloženie?',
        a: 'Pawly ti zloženie rozanalyzuje — odfotíš obal alebo vložíš text a dostaneš skóre, prednosti, riziká aj upozornenia voči profilu psa.',
      },
    ],
    relatedSlugs: ['prve-priznaky-alergie-na-krmivo'],
  },
  {
    slug: 'ockovaci-kalendar-psa',
    category: 'zdravie',
    title: 'Očkovací kalendár psa',
    description:
      'Prehľad očkovaní psa od šteňaťa po dospelosť: čo je povinné, čo odporúčané a ako často preočkovať. Praktický kalendár a tipy, ako nezmeškať termín.',
    intro:
      'Správne načasované očkovanie je základ prevencie. Tento prehľad ti pomôže zorientovať sa, čo a kedy pes potrebuje — konkrétny plán vždy potvrdí veterinár.',
    updated: '2026-06-21',
    ctaIntent: 'passport',
    sections: [
      {
        heading: 'Šteňatá: základná séria',
        paragraphs: [
          'Šteňatá dostávajú očkovanie vo viacerých dávkach, zvyčajne od 6. – 8. týždňa, s preočkovaním v niekoľkotýždňových intervaloch. Týmto sa postupne buduje imunita po vyprchaní materských protilátok.',
          'Do ukončenia základnej série je vhodné obmedziť kontakt s neznámymi psami a rizikovým prostredím.',
        ],
      },
      {
        heading: 'Dospelé psy: preočkovanie',
        paragraphs: [
          'Dospelé psy sa preočkúvajú spravidla raz ročne alebo podľa typu vakcíny a odporúčania veterinára. Besnota je na Slovensku povinná.',
          'Základné (core) vakcíny pokrývajú psinku, parvovirózu, infekčnú hepatitídu a leptospirózu; ďalšie sa pridávajú podľa rizika (napr. psincový kašeľ).',
        ],
      },
      {
        heading: 'Ako nezmeškať termín',
        paragraphs: [
          'Pri väčšom oneskorení môže byť potrebné sériu zopakovať, preto sa oplatí mať termíny pod kontrolou.',
          'V digitálnom zdravotnom pase Pawly máš vakcinácie aj termíny preočkovania na jednom mieste a appka ťa upozorní pred blížiacim sa termínom.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Čo ak neviem dátum posledného očkovania?',
        a: 'Údaje nájdeš v očkovacom preukaze. Stránku preukazu môžeš v Pawly odfotiť a AI z nej vytiahne vakcinácie, ktoré potvrdíš.',
      },
      {
        q: 'Je besnota povinná každý rok?',
        a: 'Interval závisí od použitej vakcíny a legislatívy — presne ti ho povie veterinár. Pawly ti termín pripomenie.',
      },
    ],
    relatedSlugs: ['prve-priznaky-alergie-na-krmivo'],
  },
  {
    slug: 'prve-priznaky-alergie-na-krmivo',
    category: 'krmivo',
    title: 'Prvé príznaky potravinovej alergie u psa',
    description:
      'Ako rozpoznať potravinovú alergiu u psa: svrbenie, tráviace ťažkosti, zápaly uší. Čo je eliminačná diéta a ako sledovať reakcie po zmene krmiva.',
    intro:
      'Potravinová alergia sa u psov prejavuje rôzne a často sa zamieňa s inými problémami. Čím skôr vzor rozpoznáš, tým ľahšie sa hľadá príčina — vždy v spolupráci s veterinárom.',
    updated: '2026-06-21',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Na čo si dať pozor',
        paragraphs: [
          'Časté prejavy sú svrbenie kože, začervenanie, nadmerné olizovanie labiek, opakované zápaly uší a tráviace ťažkosti (hnačka, zvracanie).',
          'Príznaky bývajú dlhodobé a nesezónne — to ich odlišuje napríklad od alergie na peľ.',
        ],
      },
      {
        heading: 'Eliminačná diéta',
        paragraphs: [
          'Pri podozrení sa pod dohľadom veterinára nasadzuje krmivo s obmedzeným počtom zložiek alebo s novým zdrojom bielkovín. Postupne sa zisťuje, čo psovi spôsobuje problém.',
          'Kľúčová je dôslednosť: počas diéty pes nesmie dostávať iné maškrty ani zvyšky.',
        ],
      },
      {
        heading: 'Ako sledovať reakcie',
        paragraphs: [
          'Po zmene krmiva sleduj, či sa príznaky zlepšujú alebo zhoršujú. V Pawly si vieš nastaviť aktuálne krmivo a cez týždenné check-iny zaznamenávať stav — appka potom upozorní na možné súvislosti.',
          'Známe alergény ulož do profilu psa; pri analýze krmiva ťa Pawly upozorní na ich prítomnosť.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Ako dlho trvá, kým sa prejaví zlepšenie?',
        a: 'Pri eliminačnej diéte to môže byť aj niekoľko týždňov. Dôležitá je trpezlivosť a dôslednosť — a konzultácia s veterinárom.',
      },
      {
        q: 'Dá sa alergia potvrdiť testom?',
        a: 'Najspoľahlivejšia je eliminačná diéta. Krvné/kožné testy majú obmedzenú výpovednú hodnotu — interpretuje ich veterinár.',
      },
    ],
    relatedSlugs: ['ako-citat-zlozenie-psieho-krmiva'],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function articlesByCategory(): Record<ArticleCategory, Article[]> {
  return {
    krmivo: articles.filter((a) => a.category === 'krmivo'),
    zdravie: articles.filter((a) => a.category === 'zdravie'),
  };
}
