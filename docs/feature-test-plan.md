# Pawly — Test plán pre zmeny branche `claude/peaceful-babbage-bq6evh`

Manuálny QA checklist pre **všetky zmeny tejto branche oproti `main`** (190+ súborov,
27 DB migrácií). Dopĺňa generický [`launch-test-plan.md`](./launch-test-plan.md) — ten
pokrýva pôvodnú appku, tento pokrýva **novú/prerobenú funkcionalitu**.

## Ako čítať tento dokument

- Každý bod má ID `Tx.y` (sekcia.poradie) a **očakávaný výsledok v zátvorke**.
- Odporúčané poradie: `T0 → T1 → … → T17` (skoršie sekcie vyrábajú dáta pre neskoršie).
- `[ADMIN]` = vyžaduje účet v `ADMIN_EMAILS`. `[AI]` = míňa OpenAI/Vision kredit.
- Tipy: maj otvorené DevTools → Network — pri každom kroku vidíš endpoint a status.
- Bug → otvor issue s ID kroku.

---

## T0 — Setup / predpoklady (inak ostatné sekcie padnú)

- [ ] **T0.1** — Spustené **všetky** Supabase migrácie `0012`–`0027` na dev projekte v poradí. (Tabuľky `check_ins`, `articles`, `article_versions`, `article_events`, `article_medical_review`, `ai_generations` existujú; `diet_entries.food_type` stĺpec existuje; `pets` má foto/species stĺpce.)
- [ ] **T0.2** — `server/.env`: `SUPABASE_*`, `FIREBASE_*`, `OPENAI_API_KEY`, `GOOGLE_VISION_API_KEY`, `ADMIN_EMAILS=<tvoj mail>`, voliteľne `NETLIFY_BUILD_HOOK_URL`. (Server naštartuje bez fail-fast chyby.)
- [ ] **T0.3** — `cd server && npm run type-check && npm test && npm run build` — všetko zelené.
- [ ] **T0.4** — `cd client && npm run type-check && npm test && npm run build` — zelené, prerender bez chyby.
- [ ] **T0.5** — `client/public/sw.js` `CACHE_VERSION` je bumpnutý (`pawly-v26`+). (Greppni predošlú verziu v gite.)
- [ ] **T0.6** — Beží `cd server && npm run dev` (`:3001`) + `cd client && npm run dev` (`:5173`); prihlásenie funguje.

---

## T1 — Prehľad / Care status (`/prehlad`)

_Nové: `OverviewPage`, `useCareStatus`, `careStatusService`, `GET /api/health/care-status`, `components/overview/`._

- [ ] **T1.1** — Po prihlásení pristanem na `/prehlad`. (V Network beží `GET /api/health/care-status` → 200.)
- [ ] **T1.2** — Karta za každé zviera so stavom + dôvodom + akciou. (Po termíne vakcinácia/odčervenie → červená; blíži sa → oranžová; čisté → zelená.)
- [ ] **T1.3** — Agregovaný hero stav navrchu. (Bez per-pet duplicity; globálne CTA „Týždenný check-in".)
- [ ] **T1.4** — Tooltip „Čo sa hodnotí?". (Vysvetľuje kritériá: vakcinácie, krmivo, check-in.)
- [ ] **T1.5** — Edge: 0 zvierat. (Uvítací/empty stav, žiadny crash.)
- [ ] **T1.6** — Edge: viac zvierat + zviera bez health dát. (Karta za každé, žiadny crash.)
- [ ] **T1.7** — Akcia na karte vedie na správnu obrazovku. (Napr. „Nastav krmivo" → `/krmivo`.)

---

## T2 — Týždenný check-in (`/check-in`)

_Nové: `CheckInPage`, `useCheckInLabels`, `components/checkIn/`, `check-ins` CRUD (`health.ts`), util `checkInSeverity`/`checkInTrends`, migrácia `0016`._

- [ ] **T2.1** — „Všetko v poriadku" → odošli. (Uloží sa `POST /api/health/check-ins`; **0 AI volaní** v Network.)
- [ ] **T2.2** — Detailný režim (changed/unsure): toggly apetít/energia/stolica/koža/správanie + váha + poznámka. (Vybraný toggle je vizuálne zvýraznený.)
- [ ] **T2.3** — Výsledná hláška podľa závažnosti (none/mild/attention). (Bez diagnózy, bezpečné formulácie.)
- [ ] **T2.4** — Zadaná váha. (Premietne sa do `WeightTrendCard`.)
- [ ] **T2.5** — Po `attention` check-ine sa karta na `/prehlad` zmení na červenú. (≤14 dní; tiebreak podľa `created_at`.)
- [ ] **T2.6** — Chýbajúci/starý check-in (>10 dní) → oranžová na `/prehlad`.
- [ ] **T2.7** — Hub: história check-inov + 30-dňové trendy. (Pri opakovaní symptómu ≥2×/30 dní návrh „zaznamenať epizódu" → `/dennik`.)

---

## T3 — Krmivo / Food coach (`/krmivo`)

_Nové: `FoodPage`, `useSetCurrentFood`, `components/food/`, util `foodInsights`; zmenené `AnalyzePage`; `diet-entries` + `food_type`, migrácia `0017`._

- [ ] **T3.1** — Z `/analyza` „Nastaviť ako aktuálne krmivo" → dialóg (typ + varovanie pri prepise) → ulož. (Na `/krmivo` ako aktuálne hlavné: názov, „od", chip vhodnosti + dôvody.)
- [ ] **T3.2** — Nastav iné **hlavné** krmivo. (Predošlé sa presunie do histórie; nikdy nie dve aktuálne hlavné.)
- [ ] **T3.3** — Pridaj **pamlsky/doplnok**. (Koexistuje s hlavným, nenahradí ho.)
- [ ] **T3.4** — „Uložiť hodnotenie" na AnalyzePage. (Len uloží analýzu — neukladá ticho diétu.)
- [ ] **T3.5** — Care status reaguje. (Žiadne aktuálne krmivo → oranžová; `UNSUITABLE` → červená.)
- [ ] **T3.6** — Food insights na `/krmivo`. (Opatrné súvislosti appeared/improved/noReaction + disclaimer; bez dát zmysluplný empty state; žiadne diagnózy.)

---

## T4 — Profil zvieraťa: foto + druhy (`/profily`)

_Nové: `usePetPhotoUpload`, `petPhotoService`, `POST /api/pets/photo`, `PetPhotoField`, `SpeciesSelect`, `constants/animalSpecies`; migrácie `0013` (foto), `0014` (katalóg), `0015` (custom species)._

- [ ] **T4.1** — Nahratie **fotky zvieraťa**. (Po uploade sa zobrazí; veľký súbor sa downscaluje; uloží sa k profilu cez `POST /api/pets/photo`.)
- [ ] **T4.2** — Výber **druhu** z katalógu. (Zoznam z `animalSpecies`; default ikona podľa druhu ak bez fotky.)
- [ ] **T4.3** — Pridanie **vlastného druhu** (custom species). (Uloží sa a ponúkne nabudúce.)
- [ ] **T4.4** — Zlý formát / príliš veľký súbor. (Zrozumná hláška, žiadny pád.)

---

## T5 — Poradňa, verejná časť

_Nové: `PoradnaIndexPage`, `PoradnaArticlePage`, `InfoPublicPage`, `ContactPublicPage`, `components/public/_`, `routes/articles.ts`, `articleService`, util `readingTime`/`slugifyHeading`/`seoSchema`.\*

- [ ] **T5.1** — `/poradna` (aj odhlásený). (Magazine layout: hero, featured, filtre kategórií, mriežka s cover obrázkami; `GET /api/articles` → 200 bez tokenu.)
- [ ] **T5.2** — Otvor článok `/poradna/:slug`. (Cover hero, breadcrumb, kategória, dátum + čas čítania, ToC, **bold**, odkazy, callouty, FAQ, Zdroje, autor, disclaimer, súvisiace; back hore aj dole.)
- [ ] **T5.3** — ToC. (Klik na položku scrolluje na sekciu H2/H3.)
- [ ] **T5.4** — Staré tematické URL → **301 na `/poradna/<slug>`**: `/analyza-krmiva-pre-psa`, `/digitalny-zdravotny-pas-pre-psa`, `/ockovanie-psa`, `/odcervenie-psa`, `/alergia-na-krmivo-u-psa`, `/co-nesmie-pes-jest`.
- [ ] **T5.5** — `/info`, `/kontakt` bez prihlásenia; `/o-aplikacii` → `/info?tab=about`; `/caste-otazky` → `/info?tab=faq`.
- [ ] **T5.6** — `GET /api/articles/neexistuje` → 404; `/poradna/neexistuje` → redirect na `/poradna`.
- [ ] **T5.7** — Koncept (nepublikovaný) sa vo verejnom API ani na `/poradna` **nezobrazí**.

---

## T6 — Admin článkov: základ (`/admin/clanky`)

_Nové: `pages/admin/_`, `components/admin/_`, `AdminGuard`, `useIsAdmin`, `routes/admin.ts`, `articleImageService`, `services/adminApi.ts`; zmenené `SettingsPage`._

- [ ] **T6.1** — `[ADMIN]` Odkaz „Správa článkov" v Nastaveniach → `/admin/clanky`. (`GET /api/admin/status` → `{ isAdmin: true }`.)
- [ ] **T6.2** — Zoznam článkov vrátane konceptov. (Chipy Publikované/Koncept + kategória.)
- [ ] **T6.3** — Nový článok (`/admin/clanky/novy`): vyplň + sekcie/bloky (odsek, podnadpis H3, odrážky, box) → Uložiť. (`POST /api/admin/articles` → 201; objaví sa v zozname.)
- [ ] **T6.4** — Edit (`/admin/clanky/:slug`). (`PUT` uloží zmenu; viditeľná po reloade.)
- [ ] **T6.5** — Tab **Náhľad**. (Vyzerá ako verejná stránka; reflektuje **neuložené** zmeny.)
- [ ] **T6.6** — Nahrať cover obrázok. (`POST /api/admin/articles/upload-image` → vyplní URL + náhľad; veľký sa downscaluje.)
- [ ] **T6.7** — Publish ↔ Koncept switch. (Koncept zmizne z `/poradna`, ostane v admin zozname.)
- [ ] **T6.8** — „Publikovať na web". (S `NETLIFY_BUILD_HOOK_URL` → Snackbar + build v Netlify; bez env → 503 `PUBLISH_NOT_CONFIGURED`, appka nepadne.)
- [ ] **T6.9** — Validácia: prázdny titulok / sekcia / duplicitný slug. (400/409 so zrozumnou hláškou; nič sa neuloží.)
- [ ] **T6.10** — Zmazať (`DELETE`, s potvrdením). (Zmizne zo zoznamu aj z API.)
- [ ] **T6.11** — **Nie-admin** účet. (Odkaz chýba; `/admin/clanky` → `AdminGuard` redirect na `/prehlad`; `GET /api/admin/articles` → 403; odhlásený → 401.)

---

## T7 — AI generovanie obsahu článku `[ADMIN] [AI]`

_Nové: `routes/adminAi.ts` (`POST /api/admin/ai/article`), `articleAiService`, migrácia `0027` (`ai_generations`). Gated `aiHeavyLimiter` + `requireAiQuota` + `requireAdmin`._

- [ ] **T7.1** — V editore „Generovať AI" → zadaj tému/prompt. (Vráti návrh obsahu — sekcie/bloky — ktorý sa dá ďalej upraviť.)
- [ ] **T7.2** — Audit log. (`GET /api/admin/articles/:slug/ai-log` ukáže záznam: kto, kedy, model.)
- [ ] **T7.3** — Prekročenie denného AI limitu. (429 `DAILY_AI_LIMIT`.)
- [ ] **T7.4** — Nie-admin volá `/api/admin/ai/article`. (403.)

---

## T8 — Redakčný stavový stroj + validácia pred publikovaním `[ADMIN]`

_Nové: `articleValidation`, `articleScheduleService`; `POST /api/admin/articles/:slug/status`, `GET .../validation`; migrácie `0022`, `0023`._

- [ ] **T8.1** — Prechody stavov (napr. draft → review → published). (Povolené prechody fungujú.)
- [ ] **T8.2** — Nepovolený prechod. (Server ho odmietne so zrozumnou chybou.)
- [ ] **T8.3** — Validácia (`GET .../validation`) na neúplnom článku. (Vráti konkrétne chýbajúce polia.)
- [ ] **T8.4** — Pokus o publish nevalidného článku. (Server-authoritative blokovanie — nepublikuje sa.)
- [ ] **T8.5** — Naplánované publikovanie (ak je v UI). (Stav `scheduled` + dátum sa uloží.)

---

## T9 — Verzie + autosave konceptu + diff `[ADMIN]`

_Nové: `articleVersionService`; `POST /api/admin/articles/:slug/autosave`, `GET .../versions`; migrácia `0021` (`article_versions`)._

- [ ] **T9.1** — Autosave počas editácie. (`POST .../autosave` v Network; indikátor „uložené/koncept".)
- [ ] **T9.2** — História verzií (`GET .../versions`). (Zoznam predošlých verzií s časom/autorom.)
- [ ] **T9.3** — Diff medzi verziami. (Zvýraznené zmeny medzi dvoma verziami.)
- [ ] **T9.4** — Obnova staršej verzie. (Obsah sa vráti na zvolenú verziu.)

---

## T10 — Odborná kontrola zdravotných článkov `[ADMIN]`

_Migrácia `0026` (`article_medical_review`)._

- [ ] **T10.1** — Polia odbornej kontroly: rizikovosť, stav review, disclaimer. (Uložia sa a zobrazia v editore.)
- [ ] **T10.2** — Rizikový článok bez kontroly. (Nedá sa publikovať / zobrazí varovanie podľa pravidiel.)
- [ ] **T10.3** — Povinný disclaimer pri zdravotnom obsahu. (Zobrazí sa na verejnej stránke článku.)

---

## T11 — Analytika výkonu článkov

_Nové: `routes/analytics.ts` (verejný `POST /api/analytics/article-event` za `analyticsLimiter`), `articleAnalyticsService`; admin `GET /api/admin/articles/metrics`, `.../:slug/metrics`; migrácia `0025` (`article_events`)._

- [ ] **T11.1** — Návšteva/čítanie verejného článku. (`POST /api/analytics/article-event` v Network bez tokenu → 2xx.)
- [ ] **T11.2** — `[ADMIN]` Prehľad metrík. (`GET /articles/metrics` — zobrazenia/dočítania per článok.)
- [ ] **T11.3** — `[ADMIN]` Detail metrík článku. (`GET /:slug/metrics`.)
- [ ] **T11.4** — Rate limit na analytics. (Bežná prevádzka neblokovaná; excesívny spam → 429.)

---

## T12 — Cover alt text + bohatšie formátovanie `[ADMIN]`

_Migrácia `0024` (`article_cover_alt`); commit „richer-formatting"._

- [ ] **T12.1** — Pole **alt text** pre cover obrázok. (Uloží sa a premietne do `<img alt>` na verejnej stránke.)
- [ ] **T12.2** — Bohatšie formátovanie v blokoch. (Renderuje správne v náhľade aj na webe — bold, odkazy, callouty.)

---

## T13 — Auth / onboarding flows

_Zmenené: `LandingPage`, `LoginPage`, `RegisterPage`, `VerifyEmailPage`, `NotFoundPage`, `DonateThanksPage`, util `onboardingIntent`._

- [ ] **T13.1** — CTA na landing/článku (food/passport) → registrácia → po overení e-mailu. (Pristanem na `/prehlad`.)
- [ ] **T13.2** — User s ≥1 psom + platný intent. (Auto-redirect na `/analyza` resp. `/zdravotny-pas`; intent vyčistený.)
- [ ] **T13.3** — Nový user (0 psov) + intent. (Personalizovaná uvítacia karta na `/prehlad`; dismiss zmaže intent; TTL 30 min.)
- [ ] **T13.4** — Login / „Vstúpiť do aplikácie" / 404 stránka / `/dakujeme`. (Všetky vedú na `/prehlad` resp. správny cieľ.)

---

## T14 — Prerobené plochy — aktívna vizuálna kontrola

_Masívne zmenené komponenty — nie regresia, ale redizajn._

- [ ] **T14.1** — **Zdravotný pas** `/zdravotny-pas`. (Nový hero, `HealthScoreRing`, `HealthTimeline`, `WeightTrendCard`, `ExpenseDonut`, `PawlyInsightCard`, `VisitDetailDialog`: dáta sedia, mobil sa nerozhádže, AI import funguje.)
- [ ] **T14.2** — **Karta pre veterinára** `/karta-pre-veterinara`. (Prerobené `vetCard/*`; **vyskúšaj tlač/PDF A4** — žiadne digitálne-only prvky v printe.)
- [ ] **T14.3** — **Landing** `/` (odhlásený). (`LandingHero`, `FeatureGrid`, `HowItWorks`, `LandingFooter`: CTA vedú správne, responzívne.)
- [ ] **T14.4** — **Výsledok analýzy** `/analyza`. (`ScoreCard`, `PersonalizedVerdictCard`, `AllergenWarningBanner`, `AiFormattedText`: skóre, verdikt, alergény, formátovaný text.)

---

## T15 — PWA / Install / SEO súbory

_Zmenené: `public/sw.js` (`pawly-v26`), `InstallAppBanner`, `InstallGuideContent`, `robots.txt`, `sitemap.xml`._

- [ ] **T15.1** — Install banner (mimo standalone). (Zobrazí sa; „návod na inštaláciu" otvorí správny obsah; v standalone režime sa banner nezobrazuje.)
- [ ] **T15.2** — Service Worker po refreshi. (Načíta sa nová verzia cache `pawly-v26`, žiadna biela obrazovka.)
- [ ] **T15.3** — Offline režim. (Pri výpadku siete sa zobrazí `offline.html`; API volania sa necachujú natrvalo.)
- [ ] **T15.4** — `robots.txt` + `sitemap.xml`. (Obsahujú aktuálne verejné URL vrátane `/poradna` a článkov.)

---

## T16 — Navigácia / Layout / Téma

_Zmenené: `Layout`, `PetSwitcher`, `public/PublicHeader`, `PublicHeaderNav`, `theme.ts`._

- [ ] **T16.1** — Bottom/side nav (prihlásený). (Nové položky Prehľad, Krmivo, Check-in, Notifikácie v správnom poradí; aktívna zvýraznená; funguje na mobile.)
- [ ] **T16.2** — `PetSwitcher`. (Prepne aktívne zviera; všetky obrazovky reagujú na zmenu.)
- [ ] **T16.3** — Verejná hlavička. (Poradňa/Info/Kontakt + prihlásenie; konzistentná naprieč verejnými stránkami.)
- [ ] **T16.4** — Téma `theme.ts`. (Light/dark prepnutie v Nastaveniach; čitateľné kontrasty; žiadne raw farby mimo palety.)

---

## T17 — Regresia (zmenené, nemalo by sa rozbiť)

_Zmenené: `HistoryPage`, `EpisodeDiaryPage`, `PrivacyPolicyRoute`, `notificationsService`, `cron.ts`._

- [ ] **T17.1** — História analýz `/historia`. (Funguje ako predtým.)
- [ ] **T17.2** — Denník epizód `/dennik`. (CRUD + AI similar-summary funguje.)
- [ ] **T17.3** — `/ochrana-sukromia`. (Renderuje sa.)
- [ ] **T17.4** — Notifikácie `/notifikacie` + „nadchádzajúce úlohy". (Feature je z `main`, ale `notificationsService`/`cron` sa menili → upozornenia stále sedia.)

---

## T18 — Ne-UI overenie (DB / build / API — neklikané v prehliadači)

- [ ] **T18.1** — Migrácia `0012_fix_audit_fn_volatility`. (Aplikovaná; audit RPC funkcie sú `volatile`, zápis do `audit_log` prejde.)
- [ ] **T18.2** — Build-time prerender z DB. (`cd client && npm run build` so `SUPABASE_*` → log „mirror obnovený z DB"; bez env → fallback, build **nespadne**.)
- [ ] **T18.3** — Prerendrované HTML. (`dist/poradna/<slug>/index.html` obsahuje text článku v `<div id="root">`.)
- [ ] **T18.4** — Per-user denný AI cap (`aiQuota.ts`). (Po prekročení `AI_DAILY_LIMIT` → 429 `DAILY_AI_LIMIT`; globálny cap → 503 `AI_GLOBAL_CAP_EXCEEDED`.)
