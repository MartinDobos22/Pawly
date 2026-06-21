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
    coverImage:
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Prečo je zloženie dôležitejšie než predná strana obalu',
        blocks: [
          {
            type: 'paragraph',
            text: 'Predná strana obalu je marketing. Skutočná kvalita krmiva sa skrýva v **zozname zložiek** a v **analytických zložkách** na zadnej strane. Práve tie hovoria, čo pes naozaj zje.',
          },
          {
            type: 'paragraph',
            text: 'Kvalita krmiva priamo ovplyvňuje trávenie, srsť aj energiu psa. Naučiť sa čítať etiketu je preto jedna z najužitočnejších zručností každého psičkára.',
          },
        ],
      },
      {
        heading: 'Poradie zložiek rozhoduje',
        blocks: [
          {
            type: 'paragraph',
            text: 'Zložky sa uvádzajú **zostupne podľa hmotnosti**. To, čo je na prvom mieste, tvorí najväčší podiel krmiva. Ideálne je, keď je na začiatku konkrétny zdroj mäsa (napr. „kuracie mäso 30 %") a nie všeobecné „mäso a živočíšne produkty".',
          },
          {
            type: 'subheading',
            text: 'Pozor na rozdeľovanie obilnín',
          },
          {
            type: 'paragraph',
            text: 'Výrobcovia niekedy „rozdelia" obilniny na viac položiek (napr. kukurica, kukuričný glutén, kukuričná múka). Jednotlivo sa zdajú malé, no spolu môžu prevažovať nad mäsom.',
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Ak je na prvom mieste obilnina alebo nekonkrétna „mäsová múčka", krmivo má pravdepodobne nízky podiel kvalitných živočíšnych bielkovín.',
          },
        ],
      },
      {
        heading: 'Zdroj a podiel bielkovín',
        blocks: [
          {
            type: 'paragraph',
            text: 'Hľadaj **konkrétny druh mäsa a jeho percento**. Čím konkrétnejší údaj, tým lepšie. „Dehydrované kuracie mäso" je koncentrovanejší zdroj bielkovín než čerstvé mäso, ktoré obsahuje veľa vody.',
          },
          {
            type: 'bullets',
            items: [
              '**Dobré:** „kuracie mäso 30 %", „dehydrovaný losos", „jahňacie mäso".',
              '**Zvážiť:** „živočíšne bielkoviny", „mäsové múčky" bez druhu.',
              '**Pozor:** ak má pes alergiu, skontroluj prítomnosť daného zdroja aj v malom množstve.',
            ],
          },
        ],
      },
      {
        heading: 'Obilniny, tuky a konzervanty',
        blocks: [
          {
            type: 'paragraph',
            text: 'Obilniny samy o sebe nie sú problém, ale ich vysoký podiel pri citlivom trávení môže škodiť. Dôležitý je aj zdroj tuku — uprednostni pomenované tuky (napr. „kurací tuk") pred všeobecným „živočíšny tuk".',
          },
          {
            type: 'bullets',
            items: [
              'Sleduj umelé farbivá a dochucovadlá — kvalitné krmivo ich spravidla nepotrebuje.',
              'Pri konzervantoch uprednostni prirodzené (tokoferoly / vitamín E) pred chemickými.',
              'Skontroluj, či je krmivo vhodné pre vek, veľkosť a aktivitu psa.',
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Nemusíš všetko prepisovať ručne — pri [analýze krmiva](/poradna/analyza-krmiva-pre-psa) ti Pawly zloženie vyhodnotí z fotky obalu a porovná ho s profilom tvojho psa.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Je krmivo bez obilnín vždy lepšie?',
        a: 'Nie nutne. „Grain-free" je vhodné pri intolerancii obilnín, ale pre väčšinu psov nie je nevyhnutné. Dôležitejší je celkový pomer a kvalita zložiek.',
      },
      {
        q: 'Čo znamenajú analytické zložky (proteín, tuk, vláknina)?',
        a: 'Sú to percentuálne podiely základných živín. Vhodnoty porovnávaj v rámci rovnakého typu krmiva (suché vs. mokré) a vždy s ohľadom na potreby konkrétneho psa.',
      },
      {
        q: 'Ako rýchlo viem posúdiť zloženie?',
        a: 'Pawly ti zloženie rozanalyzuje — odfotíš obal alebo vložíš text a dostaneš skóre, prednosti, riziká aj upozornenia voči profilu psa.',
      },
      {
        q: 'Sú „mäsové múčky" zlé?',
        a: 'Nie automaticky. Pomenovaná múčka (napr. „kuracia múčka") je koncentrovaný zdroj bielkovín. Problém je skôr nekonkrétne označenie bez druhu mäsa.',
      },
    ],
    sources: [
      { label: 'FEDIAF — Nutritional Guidelines for Pet Food', url: 'https://www.fediaf.org/' },
      {
        label: 'WSAVA — Global Nutrition Guidelines',
        url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
      },
    ],
    relatedSlugs: ['analyza-krmiva-pre-psa', 'prve-priznaky-alergie-na-krmivo'],
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
    coverImage:
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'passport',
    sections: [
      {
        heading: 'Šteňatá: základná séria',
        blocks: [
          {
            type: 'paragraph',
            text: 'Šteňatá dostávajú očkovanie vo **viacerých dávkach**, zvyčajne od 6. – 8. týždňa, s preočkovaním v niekoľkotýždňových intervaloch. Týmto sa postupne buduje imunita po vyprchaní materských protilátok.',
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Do ukončenia základnej série je vhodné obmedziť kontakt s neznámymi psami a rizikovým prostredím — imunita ešte nie je úplná.',
          },
        ],
      },
      {
        heading: 'Dospelé psy: preočkovanie',
        blocks: [
          {
            type: 'paragraph',
            text: 'Dospelé psy sa preočkúvajú spravidla raz ročne alebo podľa typu vakcíny a odporúčania veterinára. **Besnota je na Slovensku povinná zo zákona.**',
          },
          {
            type: 'subheading',
            text: 'Core vs. non-core vakcíny',
          },
          {
            type: 'bullets',
            items: [
              '**Core (základné):** psinka, parvoviróza, infekčná hepatitída, leptospiróza.',
              '**Povinné:** besnota.',
              '**Non-core (podľa rizika):** psincový kašeľ a ďalšie podľa prostredia psa.',
            ],
          },
        ],
      },
      {
        heading: 'Ako nezmeškať termín',
        blocks: [
          {
            type: 'paragraph',
            text: 'Pri väčšom oneskorení môže byť potrebné sériu zopakovať, preto sa oplatí mať termíny pod kontrolou.',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'V [digitálnom zdravotnom pase](/poradna/digitalny-zdravotny-pas-pre-psa) máš vakcinácie aj termíny preočkovania na jednom mieste a Pawly ťa upozorní pred blížiacim sa termínom.',
          },
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
      {
        q: 'Môže sa šteňa stretávať s inými psami pred dokončením očkovania?',
        a: 'Kontakt s neznámymi a neočkovanými psami je vhodné obmedziť až do ukončenia základnej série. Riadený kontakt so zdravými, očkovanými psami konzultuj s veterinárom.',
      },
    ],
    sources: [
      {
        label: 'WSAVA — Vaccination Guidelines',
        url: 'https://wsava.org/global-guidelines/vaccination-guidelines/',
      },
      { label: 'Štátna veterinárna a potravinová správa SR', url: 'https://www.svps.sk/' },
    ],
    relatedSlugs: ['ockovanie-psa', 'digitalny-zdravotny-pas-pre-psa'],
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
    coverImage:
      'https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Na čo si dať pozor',
        blocks: [
          {
            type: 'paragraph',
            text: 'Časté prejavy sú **svrbenie kože, začervenanie, nadmerné olizovanie labiek, opakované zápaly uší** a tráviace ťažkosti (hnačka, zvracanie).',
          },
          {
            type: 'paragraph',
            text: 'Príznaky bývajú **dlhodobé a nesezónne** — to ich odlišuje napríklad od alergie na peľ, ktorá kolíše počas roka.',
          },
        ],
      },
      {
        heading: 'Eliminačná diéta',
        blocks: [
          {
            type: 'paragraph',
            text: 'Pri podozrení sa pod dohľadom veterinára nasadzuje krmivo s **obmedzeným počtom zložiek** alebo s **novým zdrojom bielkovín**. Postupne sa zisťuje, čo psovi spôsobuje problém.',
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Počas diéty pes **nesmie** dostávať iné maškrty ani zvyšky zo stola. Jediné „prešľapnutie" môže výsledok znehodnotiť.',
          },
        ],
      },
      {
        heading: 'Ako sledovať reakcie',
        blocks: [
          {
            type: 'paragraph',
            text: 'Po zmene krmiva sleduj, či sa príznaky zlepšujú alebo zhoršujú. Známe alergény ulož do profilu psa — pri [analýze krmiva](/poradna/analyza-krmiva-pre-psa) ťa Pawly upozorní na ich prítomnosť.',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Cez týždenné check-iny v Pawly si vieš zaznamenávať stav psa a appka potom upozorní na možné súvislosti so zmenou krmiva.',
          },
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
      {
        q: 'Aký je rozdiel medzi alergiou a intoleranciou?',
        a: 'Alergia je reakcia imunitného systému, intolerancia je tráviaci problém bez imunitnej zložky. Prejavy sa môžu prekrývať — odlíši ich veterinár.',
      },
    ],
    sources: [
      {
        label: 'AVMA — Pet food and nutrition',
        url: 'https://www.avma.org/resources-tools/pet-owners/petcare',
      },
      {
        label: 'WSAVA — Global Nutrition Guidelines',
        url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
      },
    ],
    relatedSlugs: ['alergia-na-krmivo-u-psa', 'ako-citat-zlozenie-psieho-krmiva'],
  },
  {
    slug: 'analyza-krmiva-pre-psa',
    category: 'krmivo',
    title: 'Analýza krmiva pre psa',
    description:
      'Zisti, či je krmivo pre tvojho psa vhodné. Pawly rozanalyzuje zloženie granúl, upozorní na alergény a porovná ich s profilom tvojho psa. Zadarmo.',
    intro:
      'Skontroluj zloženie granúl, odhaľ alergény a zisti, či krmivo sedí tvojmu psovi — za pár sekúnd.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Prečo sa oplatí kontrolovať zloženie krmiva',
        blocks: [
          {
            type: 'paragraph',
            text: 'Kvalita krmiva priamo ovplyvňuje **trávenie, srsť aj energiu** psa. Na obale sa však ťažko orientuje — poradie zložiek, zdroj bielkovín a skryté obilniny či konzervanty veľa napovedia o tom, či je krmivo vhodné.',
          },
          {
            type: 'paragraph',
            text: 'Ak si nie si istý, ako etiketu čítať, pomôže náš návod [ako čítať zloženie psieho krmiva](/poradna/ako-citat-zlozenie-psieho-krmiva).',
          },
        ],
      },
      {
        heading: 'Aké zložky si všímať',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Podiel a zdroj mäsa (konkrétny druh vs. „mäsové múčky").',
              'Obilniny a ich množstvo (časté pri citlivom trávení).',
              'Konzervanty, farbivá a dochucovadlá.',
              'Vhodnosť pre vek, veľkosť a aktivitu psa.',
            ],
          },
        ],
      },
      {
        heading: 'Alergény a intolerancie',
        blocks: [
          {
            type: 'paragraph',
            text: 'Ak má pes známe alergie alebo intolerancie, ulož ich do [digitálneho zdravotného pasu](/poradna/digitalny-zdravotny-pas-pre-psa). Pawly potom pri každej analýze porovná zloženie s profilom a upozorní na možný konflikt.',
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Upozornenie na alergén nie je diagnóza — pri podozrení na alergiu vždy konzultuj veterinára.',
          },
        ],
      },
      {
        heading: 'Ako Pawly analyzuje krmivo',
        blocks: [
          {
            type: 'paragraph',
            text: 'Vlož zloženie textom alebo **odfoť obal** — Pawly text načíta (OCR) a vyhodnotí skóre, prednosti, riziká a upozornenia voči profilu psa.',
          },
          {
            type: 'paragraph',
            text: 'Výsledok si môžeš uložiť a nastaviť dané krmivo ako aktuálne, aby Pawly sledoval reakcie psa v čase.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Ako zistím, či je krmivo pre môjho psa vhodné?',
        a: 'Skontroluj zloženie — podiel mäsa, zdroj bielkovín, prítomnosť obilnín a konzervantov — a porovnaj ho s alergiami a zdravotným stavom psa. Pawly ti zloženie rozanalyzuje a upozorní na rizikové zložky voči profilu tvojho psa.',
      },
      {
        q: 'Čo znamenajú alergény v krmive?',
        a: 'Alergén je zložka, na ktorú môže pes reagovať (napr. kuracie mäso, hovädzie, obilniny). Pawly porovná zloženie s alergiami uloženými v profile a označí možný konflikt. Nejde o diagnózu — pri podozrení na alergiu sa poraď s veterinárom.',
      },
      {
        q: 'Musím prepisovať celé zloženie ručne?',
        a: 'Nie. Môžeš odfotiť obal alebo nahrať PDF a Pawly text načíta automaticky (OCR). Potom stačí spustiť analýzu.',
      },
      {
        q: 'Je analýza krmiva zadarmo?',
        a: 'Áno, základná analýza krmiva v Pawly je zadarmo.',
      },
    ],
    sources: [
      { label: 'FEDIAF — Nutritional Guidelines for Pet Food', url: 'https://www.fediaf.org/' },
      {
        label: 'WSAVA — Global Nutrition Guidelines',
        url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
      },
    ],
    relatedSlugs: ['ako-citat-zlozenie-psieho-krmiva', 'digitalny-zdravotny-pas-pre-psa'],
  },
  {
    slug: 'digitalny-zdravotny-pas-pre-psa',
    category: 'zdravie',
    title: 'Digitálny zdravotný pas pre psa',
    description:
      'Maj očkovania, odčervenia, vyšetrenia a alergie psa na jednom mieste. Digitálny zdravotný preukaz psa s pripomienkami a kartou pre veterinára. Zadarmo.',
    intro:
      'Očkovania, odčervenia, vyšetrenia aj alergie tvojho psa prehľadne na jednom mieste — vždy po ruke.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'passport',
    sections: [
      {
        heading: 'Čo si v ňom vieš viesť',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Očkovania a termíny preočkovania.',
              'Odčervenia a ošetrenia proti kliešťom a blchám.',
              'Vyšetrenia, lieky a chronické stavy.',
              'Alergie a intolerancie — využijú sa aj pri [analýze krmiva](/poradna/analyza-krmiva-pre-psa).',
            ],
          },
        ],
      },
      {
        heading: 'Import zo starého preukazu cez AI',
        blocks: [
          {
            type: 'paragraph',
            text: 'Nemusíš nič prepisovať ručne. **Odfoť stránku** očkovacieho preukazu a Pawly z nej vytiahne údaje, ktoré už len potvrdíš.',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Import funguje aj pri papierových preukazoch — odfotené vakcinácie skontroluješ a uložíš na pár klikov.',
          },
        ],
      },
      {
        heading: 'Pripomienky a karta pre veterinára',
        blocks: [
          {
            type: 'paragraph',
            text: 'Pawly ťa **upozorní pred termínom** očkovania či odčervenia a pred návštevou veterinára pripraví prehľadnú kartu so súhrnom dôležitých údajov.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Čo je digitálny zdravotný pas pre psa?',
        a: 'Je to prehľadná evidencia zdravia psa na jednom mieste — očkovania, odčervenia, ošetrenia proti parazitom, vyšetrenia, alergie a chronické stavy. Máš ho vždy po ruke v telefóne.',
      },
      {
        q: 'Môžem si do neho preniesť starý očkovací preukaz?',
        a: 'Áno. Stránku preukazu odfotíš a Pawly z nej pomocou AI vytiahne údaje (napr. vakcinácie), ktoré si potom potvrdíš.',
      },
      {
        q: 'Pripomenie mi Pawly termíny očkovania a odčervenia?',
        a: 'Áno, vieš si nastaviť pripomienky a Pawly ťa upozorní pred blížiacim sa termínom.',
      },
      {
        q: 'Sú moje údaje v bezpečí?',
        a: 'Dáta sú uložené zabezpečene a viazané na tvoj účet. Prístup k nim máš len ty.',
      },
    ],
    sources: [
      {
        label: 'WSAVA — Vaccination Guidelines',
        url: 'https://wsava.org/global-guidelines/vaccination-guidelines/',
      },
      {
        label: 'AVMA — Pet owner resources',
        url: 'https://www.avma.org/resources-tools/pet-owners/petcare',
      },
    ],
    relatedSlugs: ['ockovanie-psa', 'odcervenie-psa', 'analyza-krmiva-pre-psa'],
  },
  {
    slug: 'ockovanie-psa',
    category: 'zdravie',
    title: 'Očkovanie psa',
    description:
      'Prehľad očkovaní psa: čo je povinné, ako často preočkovať a ako nezmeškať termín. Pawly ti vakcinácie eviduje a pripomenie blížiace sa preočkovanie.',
    intro: 'Maj prehľad o tom, čo a kedy psa očkovať — a nezmeškaj žiadne preočkovanie.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1597633425046-08f5110420b5?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'passport',
    sections: [
      {
        heading: 'Prečo je očkovanie dôležité',
        blocks: [
          {
            type: 'paragraph',
            text: 'Očkovanie chráni psa pred **vážnymi a často smrteľnými chorobami** (psinka, parvoviróza, besnota). Pravidelné preočkovanie udržuje imunitu na potrebnej úrovni počas celého života psa.',
          },
        ],
      },
      {
        heading: 'Povinné vs. odporúčané',
        blocks: [
          {
            type: 'bullets',
            items: [
              '**Povinné na Slovensku:** očkovanie proti besnote.',
              '**Základné (core):** psinka, parvoviróza, infekčná hepatitída, leptospiróza.',
              '**Odporúčané podľa rizika:** psincový kašeľ a ďalšie podľa prostredia psa.',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Besnota je povinná zo zákona. Jej zanedbanie môže mať okrem zdravotného aj právny dôsledok.',
          },
        ],
      },
      {
        heading: 'Kalendár a pripomienky',
        blocks: [
          {
            type: 'paragraph',
            text: 'V [digitálnom zdravotnom pase](/poradna/digitalny-zdravotny-pas-pre-psa) máš všetky vakcinácie aj termíny preočkovania na jednom mieste. Pawly ťa upozorní pred blížiacim sa termínom, takže na nič nezabudneš.',
          },
          {
            type: 'paragraph',
            text: 'Detailný prehľad podľa veku psa nájdeš v článku [očkovací kalendár psa](/poradna/ockovaci-kalendar-psa).',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Aké očkovania pes potrebuje?',
        a: 'Základ tvorí kombinovaná vakcína proti psinke, parvoviróze, infekčnej hepatitíde a leptospiróze, plus očkovanie proti besnote (na Slovensku povinné). Veterinár môže odporučiť aj ďalšie podľa rizika (napr. psincový kašeľ).',
      },
      {
        q: 'Ako často sa očkovanie opakuje?',
        a: 'Šteňatá majú základnú sériu vo viacerých dávkach, potom nasleduje preočkovanie. Dospelé psy sa preočkúvajú spravidla raz ročne alebo podľa typu vakcíny a odporúčania veterinára.',
      },
      {
        q: 'Čo ak zmeškám termín preočkovania?',
        a: 'Pri väčšom oneskorení môže byť potrebné sériu zopakovať. Preto sa oplatí mať termíny pod kontrolou — Pawly ti pripomenie blížiace sa preočkovanie.',
      },
      {
        q: 'Kde mám očkovania evidované?',
        a: 'V digitálnom zdravotnom pase Pawly. Záznamy si pridáš ručne alebo importuješ z fotky očkovacieho preukazu.',
      },
    ],
    sources: [
      {
        label: 'WSAVA — Vaccination Guidelines',
        url: 'https://wsava.org/global-guidelines/vaccination-guidelines/',
      },
      { label: 'Štátna veterinárna a potravinová správa SR', url: 'https://www.svps.sk/' },
    ],
    relatedSlugs: ['ockovaci-kalendar-psa', 'odcervenie-psa', 'digitalny-zdravotny-pas-pre-psa'],
  },
  {
    slug: 'odcervenie-psa',
    category: 'zdravie',
    title: 'Odčervenie psa',
    description:
      'Ako často odčervovať psa, aké sú príznaky parazitov a ako nezmeškať termín. Pawly eviduje odčervenia aj ochranu proti kliešťom a pripomenie ďalší termín.',
    intro: 'Pravidelné odčervenie chráni psa aj domácnosť — maj termíny pod kontrolou.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'passport',
    sections: [
      {
        heading: 'Prečo odčervovať pravidelne',
        blocks: [
          {
            type: 'paragraph',
            text: 'Črevné parazity oslabujú psa, zhoršujú trávenie a **niektoré sa môžu preniesť aj na človeka** (zoonózy). Pravidelné odčervenie udržuje psa v kondícii a znižuje riziko nákazy v domácnosti.',
          },
        ],
      },
      {
        heading: 'Ako často a čím',
        blocks: [
          {
            type: 'bullets',
            items: [
              '**Dospelý pes:** spravidla každé 3 mesiace.',
              '**Šteňatá a brezivé/dojčiace sučky:** častejšie podľa odporúčania veterinára.',
              '**Prípravok a dávkovanie:** vždy podľa hmotnosti psa a pokynov veterinára.',
            ],
          },
        ],
      },
      {
        heading: 'Na čo si dať pozor',
        blocks: [
          {
            type: 'paragraph',
            text: 'Odčervenie **nenahrádza** ochranu proti kliešťom a blchám — sú to dve samostatné veci.',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Obe si vieš prehľadne viesť v [digitálnom zdravotnom pase](/poradna/digitalny-zdravotny-pas-pre-psa) spolu s pripomienkami na ďalší termín.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Ako často odčervovať psa?',
        a: 'Bežne sa dospelý pes odčervuje približne každé 3 mesiace, šteňatá častejšie. Frekvencia závisí od veku, prostredia a životného štýlu psa — presné odporúčanie ti dá veterinár.',
      },
      {
        q: 'Aké sú príznaky parazitov u psa?',
        a: 'Možné príznaky sú hnačka, zvracanie, chudnutie, matná srsť, „sánkovanie" po zadku alebo viditeľné články v truse. Pri podozrení sa poraď s veterinárom — nejde o diagnózu.',
      },
      {
        q: 'Aký je rozdiel medzi odčervením a ochranou proti kliešťom?',
        a: 'Odčervenie cieli na vnútorné parazity (črevné červy). Ochrana proti kliešťom a blchám rieši vonkajšie parazity. Obe sú dôležité a evidujú sa samostatne.',
      },
      {
        q: 'Ako si zapamätám termíny odčervenia?',
        a: 'Záznamy o odčervení a ošetreniach proti parazitom si vedieš v zdravotnom pase Pawly, ktorý ti pripomenie ďalší termín.',
      },
    ],
    sources: [
      { label: 'ESCCAP — Worm control in dogs and cats', url: 'https://www.esccap.org/' },
      { label: 'WSAVA — Global guidelines', url: 'https://wsava.org/global-guidelines/' },
    ],
    relatedSlugs: ['ockovanie-psa', 'digitalny-zdravotny-pas-pre-psa'],
  },
  {
    slug: 'alergia-na-krmivo-u-psa',
    category: 'krmivo',
    title: 'Alergia na krmivo u psa',
    description:
      'Príznaky alergie a intolerancie na krmivo u psa, najčastejšie alergény a eliminačná diéta. Pawly upozorní na alergény v krmive a pomôže sledovať reakcie.',
    intro: 'Rozpoznaj príznaky, pochop najčastejšie alergény a vyber krmivo, ktoré psovi sedí.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Príznaky alergie a intolerancie',
        blocks: [
          {
            type: 'bullets',
            items: [
              'Svrbenie, začervenanie kože, nadmerné olizovanie labiek.',
              'Opakované zápaly uší.',
              'Tráviace ťažkosti — hnačka, zvracanie, plynatosť.',
              'Matná srsť alebo nadmerné vypadávanie.',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'Podobné príznaky majú aj iné príčiny (parazity, alergia na peľ). Diagnózu vždy potvrdí veterinár.',
          },
        ],
      },
      {
        heading: 'Najčastejšie alergény',
        blocks: [
          {
            type: 'paragraph',
            text: 'Najčastejšie ide o konkrétny **zdroj bielkovín** (hovädzie, kuracie, mliečne výrobky), niekedy o obilniny. Kľúčové je vedieť, čo presne pes neznáša — a to potom dôsledne sledovať v zložení krmiva.',
          },
          {
            type: 'paragraph',
            text: 'Pri výbere ti pomôže návod [ako čítať zloženie psieho krmiva](/poradna/ako-citat-zlozenie-psieho-krmiva).',
          },
        ],
      },
      {
        heading: 'Ako pomôže analýza krmiva',
        blocks: [
          {
            type: 'paragraph',
            text: 'Ulož alergény do profilu psa a pri každej [analýze krmiva](/poradna/analyza-krmiva-pre-psa) ťa Pawly upozorní na ich prítomnosť.',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Po zmene krmiva vieš cez týždenné check-iny sledovať, či sa príznaky zlepšili.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Ako spoznám alergiu na krmivo u psa?',
        a: 'Časté prejavy sú svrbenie kože, začervenanie, opakované zápaly uší, tráviace ťažkosti alebo nadmerné olizovanie labiek. Podobné príznaky však majú aj iné príčiny — diagnózu potvrdí veterinár.',
      },
      {
        q: 'Ktoré zložky bývajú najčastejšími alergénmi?',
        a: 'Najčastejšie sú to bielkovinové zdroje ako hovädzie, kuracie či mliečne výrobky, niekedy aj obilniny. U každého psa to však môže byť iné.',
      },
      {
        q: 'Čo je eliminačná diéta?',
        a: 'Je to postup, pri ktorom pes dostáva krmivo s obmedzeným počtom zložiek (alebo novým zdrojom bielkovín) a postupne sa zisťuje, čo mu robí problém. Vždy ju veď pod dohľadom veterinára.',
      },
      {
        q: 'Ako mi Pawly pomôže pri alergii?',
        a: 'Uložíš známe alergény do profilu psa a Pawly pri analýze krmiva upozorní na ich prítomnosť. Cez týždenné check-iny vieš sledovať aj reakcie po zmene krmiva.',
      },
    ],
    sources: [
      {
        label: 'WSAVA — Global Nutrition Guidelines',
        url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
      },
      {
        label: 'AVMA — Pet owner resources',
        url: 'https://www.avma.org/resources-tools/pet-owners/petcare',
      },
    ],
    relatedSlugs: [
      'prve-priznaky-alergie-na-krmivo',
      'analyza-krmiva-pre-psa',
      'co-nesmie-pes-jest',
    ],
  },
  {
    slug: 'co-nesmie-pes-jest',
    category: 'krmivo',
    title: 'Čo nesmie pes jesť',
    description:
      'Zoznam potravín nebezpečných pre psa: čokoláda, hrozno, cibuľa, cesnak, xylitol a ďalšie. Čo robiť pri otrave a ako predísť rizikovým zložkám v krmive.',
    intro: 'Niektoré bežné potraviny sú pre psa toxické. Vedieť, ktoré, môže zachrániť život.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Najnebezpečnejšie potraviny',
        blocks: [
          {
            type: 'bullets',
            items: [
              '**Čokoláda a kakao** (teobromín).',
              '**Hrozno a hrozienka** (riziko zlyhania obličiek).',
              '**Cibuľa, cesnak, pór** (poškodzujú červené krvinky).',
              '**Xylitol** — sladidlo v žuvačkách a sladkostiach (prudký pokles cukru).',
              '**Alkohol, kofeín, makadamové orechy, surové cesto.**',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Čokoláda je pre psy vysoko toxická — čím horkejšia, tým nebezpečnejšia. Už malé množstvo u malého psa môže byť rizikové.',
          },
        ],
      },
      {
        heading: 'Čo robiť pri podozrení na otravu',
        blocks: [
          {
            type: 'paragraph',
            text: 'Ak pes zjedol niečo z týchto potravín, **bezodkladne kontaktuj veterinára** alebo veterinárnu pohotovosť a povedz, čo a koľko zjedol.',
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Pri viacerých látkach rozhoduje rýchlosť — nečakaj na príznaky a nevyvolávaj zvracanie bez pokynu veterinára.',
          },
        ],
      },
      {
        heading: 'Ako predísť rizikovým zložkám',
        blocks: [
          {
            type: 'paragraph',
            text: 'Okrem ľudských potravín si dávaj pozor aj na zloženie krmiva a maškŕt. Pri [analýze krmiva](/poradna/analyza-krmiva-pre-psa) ťa Pawly upozorní na rizikové a nevhodné zložky voči profilu tvojho psa.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Prečo je čokoláda pre psa nebezpečná?',
        a: 'Čokoláda obsahuje teobromín, ktorý psy metabolizujú pomaly. Môže spôsobiť zvracanie, búšenie srdca, kŕče až ohrozenie života — tým horšie, čím je čokoláda horkejšia.',
      },
      {
        q: 'Smie pes hrozno alebo hrozienka?',
        a: 'Nie. Hrozno a hrozienka môžu u psov spôsobiť akútne zlyhanie obličiek, a to už pri malom množstve. Vyhni sa im úplne.',
      },
      {
        q: 'Čo robiť, keď pes zje niečo zakázané?',
        a: 'Bezodkladne kontaktuj veterinára alebo pohotovosť a uveď, čo a koľko pes zjedol. Nečakaj na príznaky — pri niektorých látkach rozhoduje čas.',
      },
      {
        q: 'Ako mám prehľad o tom, čo pes znáša?',
        a: 'V profile psa si vedieš viesť alergie a intolerancie a pri analýze krmiva ťa Pawly upozorní na rizikové zložky.',
      },
    ],
    sources: [
      {
        label: 'ASPCA — People Foods to Avoid Feeding Your Pets',
        url: 'https://www.aspca.org/pet-care/animal-poison-control/people-foods-avoid-feeding-your-pets',
      },
      {
        label: 'AVMA — Household hazards',
        url: 'https://www.avma.org/resources-tools/pet-owners/petcare/household-hazards',
      },
    ],
    relatedSlugs: ['alergia-na-krmivo-u-psa', 'analyza-krmiva-pre-psa'],
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
