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
    coverImage:
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=70',
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
    coverImage:
      'https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?auto=format&fit=crop&w=1200&q=70',
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
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Prečo sa oplatí kontrolovať zloženie krmiva',
        paragraphs: [
          'Kvalita krmiva priamo ovplyvňuje trávenie, srsť aj energiu psa. Na obale sa však ťažko orientuje — poradie zložiek, zdroj bielkovín a skryté obilniny či konzervanty veľa napovedia o tom, či je krmivo pre tvojho psa vhodné.',
        ],
      },
      {
        heading: 'Aké zložky si všímať',
        paragraphs: [],
        bullets: [
          'Podiel a zdroj mäsa (konkrétny druh vs. „mäsové múčky").',
          'Obilniny a ich množstvo (časté pri citlivom trávení).',
          'Konzervanty, farbivá a dochucovadlá.',
          'Vhodnosť pre vek, veľkosť a aktivitu psa.',
        ],
      },
      {
        heading: 'Alergény a intolerancie',
        paragraphs: [
          'Ak má pes známe alergie alebo intolerancie, ulož ich do digitálneho zdravotného pasu. Pawly potom pri každej analýze porovná zloženie s profilom a upozorní na možný konflikt.',
        ],
      },
      {
        heading: 'Ako Pawly analyzuje krmivo',
        paragraphs: [
          'Vlož zloženie textom alebo odfoť obal — Pawly text načíta a vyhodnotí skóre, prednosti, riziká a upozornenia voči profilu psa. Výsledok si môžeš uložiť a nastaviť dané krmivo ako aktuálne, aby Pawly sledoval reakcie psa v čase.',
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
        paragraphs: [],
        bullets: [
          'Očkovania a termíny preočkovania.',
          'Odčervenia a ošetrenia proti kliešťom a blchám.',
          'Vyšetrenia, lieky a chronické stavy.',
          'Alergie a intolerancie — využijú sa aj pri analýze krmiva.',
        ],
      },
      {
        heading: 'Import zo starého preukazu cez AI',
        paragraphs: [
          'Nemusíš nič prepisovať ručne. Odfoť stránku očkovacieho preukazu a Pawly z nej vytiahne údaje, ktoré už len potvrdíš.',
        ],
      },
      {
        heading: 'Pripomienky a karta pre veterinára',
        paragraphs: [
          'Pawly ťa upozorní pred termínom očkovania či odčervenia a pred návštevou veterinára pripraví prehľadnú kartu so súhrnom dôležitých údajov.',
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
    relatedSlugs: ['ockovanie-psa', 'odcervenie-psa', 'analyza-krmiva-pre-psa'],
  },
  {
    slug: 'ockovanie-psa',
    category: 'zdravie',
    title: 'Očkovanie psa',
    description:
      'Prehľad očkovaní psa: čo je povinné, ako často preočkovať a ako nezmeškať termín. Pawly ti vakcinácie eviduje a pripomenie blížiace sa preočkovanie.',
    intro:
      'Maj prehľad o tom, čo a kedy psa očkovať — a nezmeškaj žiadne preočkovanie.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'passport',
    sections: [
      {
        heading: 'Prečo je očkovanie dôležité',
        paragraphs: [
          'Očkovanie chráni psa pred vážnymi a často smrteľnými chorobami (psinka, parvoviróza, besnota). Pravidelné preočkovanie udržuje imunitu na potrebnej úrovni počas celého života psa.',
        ],
      },
      {
        heading: 'Povinné vs. odporúčané',
        paragraphs: [],
        bullets: [
          'Povinné na Slovensku: očkovanie proti besnote.',
          'Základné (core): psinka, parvoviróza, infekčná hepatitída, leptospiróza.',
          'Odporúčané podľa rizika: psincový kašeľ a ďalšie podľa prostredia psa.',
        ],
      },
      {
        heading: 'Kalendár a pripomienky',
        paragraphs: [
          'V digitálnom zdravotnom pase máš všetky vakcinácie aj termíny preočkovania na jednom mieste. Pawly ťa upozorní pred blížiacim sa termínom, takže na nič nezabudneš.',
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
    relatedSlugs: ['odcervenie-psa', 'digitalny-zdravotny-pas-pre-psa', 'ockovaci-kalendar-psa'],
  },
  {
    slug: 'odcervenie-psa',
    category: 'zdravie',
    title: 'Odčervenie psa',
    description:
      'Ako často odčervovať psa, aké sú príznaky parazitov a ako nezmeškať termín. Pawly eviduje odčervenia aj ochranu proti kliešťom a pripomenie ďalší termín.',
    intro:
      'Pravidelné odčervenie chráni psa aj domácnosť — maj termíny pod kontrolou.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'passport',
    sections: [
      {
        heading: 'Prečo odčervovať pravidelne',
        paragraphs: [
          'Črevné parazity oslabujú psa, zhoršujú trávenie a niektoré sa môžu preniesť aj na človeka. Pravidelné odčervenie udržuje psa v kondícii a znižuje riziko nákazy v domácnosti.',
        ],
      },
      {
        heading: 'Ako často a čím',
        paragraphs: [],
        bullets: [
          'Dospelý pes: spravidla každé 3 mesiace.',
          'Šteňatá a brezivé/dojčiace sučky: častejšie podľa odporúčania veterinára.',
          'Prípravok a dávkovanie vždy podľa hmotnosti psa a pokynov veterinára.',
        ],
      },
      {
        heading: 'Na čo si dať pozor',
        paragraphs: [
          'Odčervenie nenahrádza ochranu proti kliešťom a blchám — sú to dve samostatné veci. Obe si vieš prehľadne viesť v digitálnom zdravotnom pase spolu s pripomienkami.',
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
    relatedSlugs: ['ockovanie-psa', 'digitalny-zdravotny-pas-pre-psa'],
  },
  {
    slug: 'alergia-na-krmivo-u-psa',
    category: 'krmivo',
    title: 'Alergia na krmivo u psa',
    description:
      'Príznaky alergie a intolerancie na krmivo u psa, najčastejšie alergény a eliminačná diéta. Pawly upozorní na alergény v krmive a pomôže sledovať reakcie.',
    intro:
      'Rozpoznaj príznaky, pochop najčastejšie alergény a vyber krmivo, ktoré psovi sedí.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Príznaky alergie a intolerancie',
        paragraphs: [],
        bullets: [
          'Svrbenie, začervenanie kože, nadmerné olizovanie labiek.',
          'Opakované zápaly uší.',
          'Tráviace ťažkosti — hnačka, zvracanie, plynatosť.',
          'Matná srsť alebo nadmerné vypadávanie.',
        ],
      },
      {
        heading: 'Najčastejšie alergény',
        paragraphs: [
          'Najčastejšie ide o konkrétny zdroj bielkovín (hovädzie, kuracie, mliečne výrobky), niekedy o obilniny. Kľúčové je vedieť, čo presne pes neznáša — a to potom dôsledne sledovať v zložení krmiva.',
        ],
      },
      {
        heading: 'Ako pomôže analýza krmiva',
        paragraphs: [
          'Ulož alergény do profilu psa a pri každej analýze krmiva ťa Pawly upozorní na ich prítomnosť. Po zmene krmiva vieš cez týždenné check-iny sledovať, či sa príznaky zlepšili.',
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
    relatedSlugs: ['analyza-krmiva-pre-psa', 'co-nesmie-pes-jest', 'prve-priznaky-alergie-na-krmivo'],
  },
  {
    slug: 'co-nesmie-pes-jest',
    category: 'krmivo',
    title: 'Čo nesmie pes jesť',
    description:
      'Zoznam potravín nebezpečných pre psa: čokoláda, hrozno, cibuľa, cesnak, xylitol a ďalšie. Čo robiť pri otrave a ako predísť rizikovým zložkám v krmive.',
    intro:
      'Niektoré bežné potraviny sú pre psa toxické. Vedieť, ktoré, môže zachrániť život.',
    updated: '2026-06-21',
    coverImage:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=70',
    ctaIntent: 'food',
    sections: [
      {
        heading: 'Najnebezpečnejšie potraviny',
        paragraphs: [],
        bullets: [
          'Čokoláda a kakao (teobromín).',
          'Hrozno a hrozienka (riziko zlyhania obličiek).',
          'Cibuľa, cesnak, pór (poškodzujú červené krvinky).',
          'Xylitol — sladidlo v žuvačkách a sladkostiach (prudký pokles cukru).',
          'Alkohol, kofeín, makadamové orechy, surové cesto.',
        ],
      },
      {
        heading: 'Čo robiť pri podozrení na otravu',
        paragraphs: [
          'Ak pes zjedol niečo z týchto potravín, bezodkladne kontaktuj veterinára alebo veterinárnu pohotovosť a povedz, čo a koľko zjedol. Pri viacerých látkach rozhoduje rýchlosť — nečakaj na príznaky.',
        ],
      },
      {
        heading: 'Ako predísť rizikovým zložkám',
        paragraphs: [
          'Okrem ľudských potravín si dávaj pozor aj na zloženie krmiva a maškŕt. Pri analýze krmiva ťa Pawly upozorní na rizikové a nevhodné zložky voči profilu tvojho psa.',
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
