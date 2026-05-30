# AnimalPassport — Pre-launch Test Plan

Manuálny QA checklist pred otvorením aplikácie reálnym používateľom. Pokrýva všetkých
12 stránok, 5 AI endpointov, 11 zdravotných modulov, multi-pet, auth, PWA, security
a edge cases. Fiktívne testovacie dokumenty na AI extraction sú v
[`test-assets/`](./test-assets/).

## Ako čítať tento dokument

- Každý bod má ID v tvare `Sx.y` (sekcia.poradie) a očakávaný výsledok v zátvorke.
- Test prebieha vždy v 2 prostrediach: **LOCAL** (`npm run dev` klient + server) a **PROD-LIKE** (deployovaný build, reálna Supabase + Firebase).
- Niektoré body označené `[PROD]` sa testujú iba v produkčnom prostredí (CORS, doménový SW, real Stripe ak relevantné).
- Bug nájdený počas testu → otvor issue, prilepenom ID kroku.

---

## S1 — Pre-launch konfigurácia

- [ ] **S1.1** — `server/.env` má všetky povinné premenné: `OPENAI_API_KEY`, `GOOGLE_VISION_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV=production`, `CORS_ORIGIN=<frontend-url-bez-koncoveho-slash>`. (Server naštartuje bez fail-fast chyby.)
- [ ] **S1.2** — `client/.env.production` má `VITE_API_URL=<api-url>`, `VITE_FIREBASE_*` (api key, auth domain, project id, app id). (Build neobsahuje `undefined` v konfigu.)
- [ ] **S1.3** — `cd server && npm run type-check` prejde 0 chýb.
- [ ] **S1.4** — `cd client && npm run type-check` prejde 0 chýb.
- [ ] **S1.5** — `cd server && npm run build` vytvorí `dist/` bez chyby.
- [ ] **S1.6** — `cd client && npm run build` vytvorí `dist/` bez chyby; warning o veľkosti chunku < blocker.
- [ ] **S1.7** — `client/public/sw.js` `CACHE_VERSION` je bumpnutý oproti minulému deploy (greppni v gite predošlú verziu).
- [ ] **S1.8** — Supabase migrácie aplikované (`supabase/migrations/`); tabuľky `users, pets, vaccinations, dewormings, ectoparasites, vet_visits, medications, medication_dose_logs, diet_entries, expenses, health_episodes, weight_logs, saved_analyses` existujú.
- [ ] **S1.9** — RLS deny-by-default na všetkých tabuľkách: dotaz z anon klienta vracia 0 riadkov.
- [ ] **S1.10** — `[PROD]` `CORS_ORIGIN` vylučuje localhost a obsahuje iba produkčný front-end origin (`Origin: http://evil.com` → preflight zamietnutý).
- [ ] **S1.11** — Firebase Service Account JSON nie je commitnutý (`git log -p | grep -i private_key` nemá zhodu okrem `.env.example`).
- [ ] **S1.12** — `.env*` súbory sú v `.gitignore` a `gitleaks` CI prešlo.

---

## S2 — Auth flow

- [ ] **S2.1** — Register: nový email + silné heslo → user vytvorený, Firebase token, Supabase `users` riadok upsertnutý (overiť cez SQL: `select * from users where firebase_uid = '<uid>'`).
- [ ] **S2.2** — Register slabé heslo (< 6 znakov) → Firebase chyba zobrazená v SK.
- [ ] **S2.3** — Register email-in-use → user-friendly hláška, žiadny stack v UI.
- [ ] **S2.4** — Login správne heslo → redirect na `/` (alebo posledný route), tokens v localStorage / Firebase persistence.
- [ ] **S2.5** — Login nesprávne heslo → hláška, žiadny PII v logs servera.
- [ ] **S2.6** — Google OAuth: popup → consent → user vytvorený alebo prilinkovaný, Supabase upsert.
- [ ] **S2.7** — Password reset: zadanie emailu → email príde, link otvorí Firebase reset stránku.
- [ ] **S2.8** — Logout → token zmazaný, refresh stránky → redirect na `/login`.
- [ ] **S2.9** — Expirovaný / invalidný token na `/api/pets` → 401 `{ error: { message: ..., code: 'UNAUTHORIZED' } }`, klient redirect na login.
- [ ] **S2.10** — `curl` na `/api/pets` bez `Authorization` headera → 401.
- [ ] **S2.11** — `curl` na `/api/pets` s podpísaným tokenom iného Firebase projektu → 401 (firebase admin reject).
- [ ] **S2.12** — `/api/health` (health check) nevyžaduje auth → 200.
- [ ] **S2.13** — Network fail počas registrácie → user vidí retry CTA, nie biely screen.

---

## S3 — Multi-pet scenáre

- [ ] **S3.1** — Vytvor pet "Bono" (dog, breed Border Collie, váha 18 kg, alergia: kuracie mäso). (Profil viditeľný v `/profily`.)
- [ ] **S3.2** — Vytvor druhého psa "Rex" (dog, mix, bez alergií).
- [ ] **S3.3** — Vytvor mačku "Mia" (cat, persian, intolerancia: laktóza). (Animal type chip ukazuje cat ikonu.)
- [ ] **S3.4** — Prepni active pet z dropdownu na "Rex" → `localStorage['granule-check-active-pet-id']` má jeho id; reload zachová výber.
- [ ] **S3.5** — Zdravotný pas zobrazuje záznamy active pet (Rex) — žiadne Bonovi vakcinácie nepretečú.
- [ ] **S3.6** — `/analyza` s active pet Bono + krmivo obsahujúce "chicken meal" → `allergenWarnings[]` obsahuje "kuracie" so `severity: 'critical'`.
- [ ] **S3.7** — Prepni na Rex (bez alergií) → tá istá analýza krmiva nevracia allergen warnings.
- [ ] **S3.8** — Edit Bono: pridaj zdravotný stav "diabetes" → `/analyza` s krmivom s vysokým cukrom → `healthWarnings[]` má diabetes warning.
- [ ] **S3.9** — Vymaž Mia → SQL check: žiadny `vet_visits.pet_id = '<mia-id>'`, ani `vaccinations`, ani `health_episodes` (CASCADE delete v Supabase). Aktívny pet sa fallbackne na iného (nie undefined).
- [ ] **S3.10** — Druhý user account B v inkognito → nevidí pets usera A. `GET /api/pets` vráti iba B's pets. Pokus `GET /api/pets/<A-pet-id>` → 404/403.
- [ ] **S3.11** — Pokus B usera o `GET /api/health/vaccinations?dogId=<A-pet-id>` → 403 (pet ownership check v `routes/health.ts`).
- [ ] **S3.12** — Active pet je zmazaný v inej session → po reloade hook fallback na first pet, nie crash.

---

## S4 — Analýza krmiva (`/`, `POST /api/analyze`)

### Text mode

- [ ] **S4.1** — Empty textarea + submit → klient ukáže validáciu, nepošle request.
- [ ] **S4.2** — Text = 50 000 znakov → analýza prejde, AI vráti score.
- [ ] **S4.3** — Text > 50 000 znakov → 400 `Presahuje limit`.
- [ ] **S4.4** — Realistický kompozičný text (slovenský) → `score` 0-100, `ingredients[]` má kategórie, žiadne emoji.
- [ ] **S4.5** — Text v angličtine ("Chicken meal, rice, beet pulp...") → AI parsuje, výstup v SK.
- [ ] **S4.6** — Text obsahuje XSS payload (`<script>alert(1)</script>`) → render v UI escaped (žiadny alert).

### File mode

- [ ] **S4.7** — Upload `03-krmivo-kvalitne.pdf` → analyza vráti score ≥ 70.
- [ ] **S4.8** — Upload `04-krmivo-problematicke.pdf` → analyza vráti score < 50, allergens (pšenica), harmful (BHA).
- [ ] **S4.9** — Upload `05-krmivo-allergen-trap.pdf` s active pet Bono (kuracie alergia) → `allergenWarnings[].severity = 'critical'`.
- [ ] **S4.10** — Upload JPG fotky krmiva (mobile camera quality) → OCR funguje, score sa vypočíta.
- [ ] **S4.11** — Upload PNG, WebP — všetky akceptované.
- [ ] **S4.12** — Upload `.txt` súbor → 400 `Neplatný formát`.
- [ ] **S4.13** — Upload `.docx` → 400.
- [ ] **S4.14** — Upload súbor > 5 MB → 400 `Súbor príliš veľký` (klient by mal zablokovať pred odoslaním).
- [ ] **S4.15** — Manuálne CURL s base64 dĺžky > 6.7M znakov → 400 server-side.

### OCR ladder

- [ ] **S4.16** — Vypnúť `GOOGLE_VISION_API_KEY` (alebo simulovať Vision 500) → fallback na OpenAI vision, response field `source: 'openai-vision'`.
- [ ] **S4.17** — Vypnúť oba (Vision + OpenAI vision) → pri PDF fallback na `pdf-parse`.
- [ ] **S4.18** — Všetko zlyhá → `source: 'none'`, klient UI ukáže "Obrázok sa nepodarilo prečítať".

### Exam alias

- [ ] **S4.19** — Poslať `examAlias: 'rtg'` → AI prompt template pre imaging použitý (overiť v server logu type detection).
- [ ] **S4.20** — Poslať `examAlias: 'neznamy'` → server ignoruje, použije heuristiku z OCR textu (žiadny 400).

### Rate limit

- [ ] **S4.21** — Spusti 21× `/api/analyze` v 60 s → 21. request 429 `Príliš veľa AI požiadaviek`.
- [ ] **S4.22** — Po 60 s je limit resetnutý.

---

## S5 — História analýz (`/historia`)

- [ ] **S5.1** — Empty state: prázdna história ukazuje friendly text + CTA na `/`.
- [ ] **S5.2** — Po `/analyza` save → záznam pribudol v `/historia` s časom a názvom krmiva.
- [ ] **S5.3** — Reload stránky → história sa znovu načíta zo Supabase (nie zmizne).
- [ ] **S5.4** — Delete jednu analýzu → zmizne; SQL `saved_analyses` riadok zmazaný.
- [ ] **S5.5** — Clear all → confirm dialóg → po potvrdení všetky zmazané.
- [ ] **S5.6** — História scopnutá na active pet (Bono histó ria ≠ Rex história).
- [ ] **S5.7** — Veľa záznamov (50+) → UI nezamrzne; ak je pagination, funguje.

---

## S6 — Zdravotný pas (`/zdravotny-pas/*`)

Pre každý modul: create, edit, delete, povinné polia, computed fields, attachmenty.

### S6.1 Vakcinácie

- [ ] **S6.1.1** — Create: name="Nobivac DHP", type="COMBINED", dateApplied=dnes, validUntil=dnes+1rok → status `VALID`.
- [ ] **S6.1.2** — Vakcína s validUntil = dnes+15d → `EXPIRING_SOON` chip oranžový.
- [ ] **S6.1.3** — Vakcína s validUntil v minulosti → `EXPIRED` chip červený.
- [ ] **S6.1.4** — dateApplied > validUntil → klient ukáže validation error, neuloží.
- [ ] **S6.1.5** — Batch number ako voliteľné pole — empty OK.
- [ ] **S6.1.6** — Attach JPG fotku k vakcináciám → preview, po reloade ostáva.
- [ ] **S6.1.7** — Edit existujúcej → update v DB.
- [ ] **S6.1.8** — Delete → confirm → záznam zmizne.

### S6.2 Odčervenia

- [ ] **S6.2.1** — Create: product="Milbemax", dateGiven=2025-01-01, intervalDays=90 → computed `nextDueDate=2025-04-01`.
- [ ] **S6.2.2** — Default intervalDays = 90 keď neuvediem.
- [ ] **S6.2.3** — Záznam staršie ako interval → UI banner "Termín prešiel".

### S6.3 Ektoparazity

- [ ] **S6.3.1** — Form="SPOT_ON", productName="Bravecto", durationDays=84 → záznam.
- [ ] **S6.3.2** — Form=COLLAR bez `intervalDays` → akceptované.

### S6.4 Návštevy veterinára

- [ ] **S6.4.1** — Create vet visit + 2 medications cez `addVisitBundle` (`POST /api/health/visit-bundle`) → atomicky uložené, `medicationIds[]` referencujú nové ids.
- [ ] **S6.4.2** — Visit obsahuje `nextCheckDate` → /karta-pre-veterinára zobrazuje upcoming check.
- [ ] **S6.4.3** — AI Import vet visit z fotky (`POST /api/interpret-passport` ekvivalent flow) — viď S9.3.

### S6.5 Lieky + dose-logy

- [ ] **S6.5.1** — Medikácia "Amoxicillin", dávka "250 mg", frekvencia "BID", endDate=startDate+10d → záznam.
- [ ] **S6.5.2** — Vytvor 10 dose-logov, 7× taken=true → frontend ukazuje 70% adherence.
- [ ] **S6.5.3** — longTerm=true bez endDate → akceptované.

### S6.6 Diéta

- [ ] **S6.6.1** — Create entry, suitability=SUITABLE → záznam.
- [ ] **S6.6.2** — Update na UNSUITABLE so suitabilityReasons[] → zachované.
- [ ] **S6.6.3** — Ukončený diet entry (endedAt nastavený) → UI ho ukazuje ako historický.

### S6.7 Výdavky

- [ ] **S6.7.1** — Create amount=42.50 EUR, category=VET_VISIT → záznam.
- [ ] **S6.7.2** — Sum po kategóriách správny v dashboard widgete.
- [ ] **S6.7.3** — relatedVetVisitId správne linkuje na visit.

### S6.8 Váha

- [ ] **S6.8.1** — 10 logov za 10 mesiacov → trend graph rastúci/klesajúci podľa dát.
- [ ] **S6.8.2** — Duplicitný dátum → najnovší override alebo error (overiť aktuálne správanie).

### S6.9 Epizódy — viď S8.

### S6.10 Attachmenty (cross-cutting)

- [ ] **S6.10.1** — Upload JPG 4000×3000 → downscale na ≤1024px JPEG 85% — preview má menší rozmer.
- [ ] **S6.10.2** — Upload 4× foto po 1.5 MB → storage size warning > 4 MB.
- [ ] **S6.10.3** — Delete attachment → preview zmizne, base64 nie je v žiadnom dotaze do AI endpointov.

### S6.11 AI Import passport

- [ ] **S6.11.1** — Foto pasu (`01-veterinarny-pas.pdf`) cez "AI Import" CTA → `POST /api/interpret-passport` → preview má 2 vakcinácie + 1 odčervenie s dátumami.
- [ ] **S6.11.2** — User môže edit pred save (názov vakcíny, batch).
- [ ] **S6.11.3** — Save → vakcinácie pribudli v zdrav. pase active pet.
- [ ] **S6.11.4** — Zlá kvalita fotky → user dostane warning "Skontrolujte výsledok".

---

## S7 — Karta pre veterinára (`/karta-pre-veterinara`)

- [ ] **S7.1** — Render: meno, plemeno, vek, váha, microchip, passport number.
- [ ] **S7.2** — Health profile sekcia: alergie, intolerancie, zdravotné stavy v SK.
- [ ] **S7.3** — Preventívna starostlivosť: aktuálne vakcinácie + status chip.
- [ ] **S7.4** — Aktívne lieky: tie ktoré majú `endDate >= today` alebo `longTerm`.
- [ ] **S7.5** — Posledné 3 návštevy v reverse chronological order.
- [ ] **S7.6** — Print preview v Chrome: `Ctrl+P` → A4, žiadne sticky AppBar / FAB v náhľade (`@media print`).
- [ ] **S7.7** — Page break: dlhý obsah ide na 2. stranu bez orezania.
- [ ] **S7.8** — Save as PDF z prehliadača → výsledok je čitateľný, čierno-biely / farebný podľa nastavenia.
- [ ] **S7.9** — Prázdny pet (žiadne dáta) → graceful empty states, nie "undefined".
- [ ] **S7.10** — Pet bez alergií → sekcia "Alergie" hovorí "Žiadne uvedené" (nie chýbajúci nadpis).

---

## S8 — Denník epizód (`/dennik`)

- [ ] **S8.1** — Vytvor epizódu category=digestive: symptomTitle="Vracanie po raňajkách", description, startedAt → uložené v Supabase (`health_episodes`).
- [ ] **S8.2** — Vytvor po jednej v každej z 6 kategórií (digestive, skin, musculoskeletal, respiratory, behavioral, other).
- [ ] **S8.3** — Filter kategória=digestive → list ukazuje iba 1 (alebo viac digestive).
- [ ] **S8.4** — Filter outcome=resolved + search "vracanie" → kombinovaný filter funguje.
- [ ] **S8.5** — Search prázdny → všetky epizódy.
- [ ] **S8.6** — Severity (mild/moderate/severe) chip správna farba.
- [ ] **S8.7** — Attachment 3× foto → každá downscaled, total < 1 MB po downscale.
- [ ] **S8.8** — Storage warning ak > 4 MB raw.
- [ ] **S8.9** — `POST /api/episodes/similar-summary` s 5 minulými epizódami → response má `summary` (SK) + `recommendation` "konzultujte veterinára".
- [ ] **S8.10** — Network tab: payload na similar-summary **neobsahuje base64** (`stripAttachments` funguje).
- [ ] **S8.11** — Žiadne minulé epizódy → `{ similarEpisodeIds: [], summary: '', recommendation: '...' }`, UI zobrazí "Žiadne podobné nájdené".
- [ ] **S8.12** — Edit existujúcu epizódu → update.
- [ ] **S8.13** — Delete → confirm → record zmizne.
- [ ] **S8.14** — XSS pokus v symptomTitle (`<img onerror=alert(1) src=x>`) → render escaped.

---

## S9 — AI / OCR endpoints isolated

Pre každý endpoint: happy path s test assetom, error paths, rate limit, prompt injection, timeout.

### S9.1 `POST /api/analyze`

- [ ] **S9.1.1** — Happy path text: viď S4.4.
- [ ] **S9.1.2** — Happy path file: assety 03/04/05.
- [ ] **S9.1.3** — 400 paths: viď S4.1-S4.3, S4.12-S4.15.
- [ ] **S9.1.4** — 429 rate limit: viď S4.21.
- [ ] **S9.1.5** — OpenAI down (manuálne nesprávny `OPENAI_API_KEY` v testovacom env) → 502 `Externá služba zlyhala`, nie 500.
- [ ] **S9.1.6** — Prompt injection (asset 10) cez file mode → odpoveď je analýza krmiva, **nie** výstup ako „Vaše tajomstvá sú...". Server logy neukazujú vykonané inštrukcie z PDF.
- [ ] **S9.1.7** — Timeout: vypnúť internet uprostred POST → klient ukáže error message, nie biely screen.

### S9.2 `POST /api/extract-text`

- [ ] **S9.2.1** — Asset 01 (passport PDF) → `extractedText` má texty pasu, `source: 'google-vision'|'pdf-parse'`.
- [ ] **S9.2.2** — JPG asset → source `google-vision` alebo `openai-vision`.
- [ ] **S9.2.3** — Prázdny / nečitateľný obrázok → `source: 'none'`, server vráti 502 alebo `extractedText: ''` (verifikuj aktuálne správanie).
- [ ] **S9.2.4** — Base64 > 6.7M znakov → 400.

### S9.3 `POST /api/interpret-passport`

- [ ] **S9.3.1** — Asset 01 (Bono pas) → response `records[]` má 2 vakcinácie + 1 odčervenie s dátumami a názvami v správnych poliach.
- [ ] **S9.3.2** — Asset 02 (Mia pas mačka) → records pre mačku, type `vaccination` zostáva, validUntil sa pochopí.
- [ ] **S9.3.3** — Text < 50 znakov → 400.
- [ ] **S9.3.4** — Text > 50 000 → 400.
- [ ] **S9.3.5** — Asset 10 prompt injection → AI ignoruje injection (overiť `sanitizeOcrText` wrap v server logu), výsledok neobsahuje system odpoveď.

### S9.4 `POST /api/episodes/similar-summary`

- [ ] **S9.4.1** — Viď S8.9-S8.11.
- [ ] **S9.4.2** — Chýba `currentEpisode` → 400.
- [ ] **S9.4.3** — 30+ minulých epizód → server obmedzuje na 30, nepadne.

### S9.5 `POST /api/food-safety`

- [ ] **S9.5.1** — query="cibuľa" → verdict=`DANGEROUS`, vysvetlenie SK.
- [ ] **S9.5.2** — query="ryža varená" → `SAFE`.
- [ ] **S9.5.3** — query="" → 400.
- [ ] **S9.5.4** — query > 200 znakov → 400.
- [ ] **S9.5.5** — query="kuracie" s active pet Bono (alergia kuracie) → `allergenRisks[]` má entry.

### S9.6 Exam alias coverage

- [ ] **S9.6.1** — Asset 06 (lab krv) cez `/api/analyze` s `examAlias='laboratorne_vysetrenia'` → AI použije prompt pre `blood_tests`.
- [ ] **S9.6.2** — Asset 07 (RTG) s `examAlias='rtg'` → prompt pre `imaging`.
- [ ] **S9.6.3** — Asset 08 (EKG) s `examAlias='ekg'` → prompt pre `cardiology`.
- [ ] **S9.6.4** — Asset 09 (SOAP) bez aliasu → heuristika detekuje typ z textu.

---

## S10 — PWA

- [ ] **S10.1** — `[PROD]` Chrome devtools → Application → Manifest: name, icons 192+512, `start_url`, `display: standalone`, žiadne errors.
- [ ] **S10.2** — `[PROD]` Application → Service Workers: registered, status active, scope `/`.
- [ ] **S10.3** — `[PROD]` Application → Cache Storage: `animalPassport-v<N>` cache existuje s app shell.
- [ ] **S10.4** — Offline (Network tab: Offline) → navigácia na neznačku → `offline.html` fallback.
- [ ] **S10.5** — Offline → POST `/api/analyze` → klient ukáže network error, nie biely screen.
- [ ] **S10.6** — CACHE_VERSION bump simulácia: zmeň verziu v `sw.js`, rebuild, reload → activate event maže staré cache (skontroluj v devtools že iba nová verzia existuje).
- [ ] **S10.7** — SW v dev móde NIE je registrovaný (`import.meta.env.PROD` check).
- [ ] **S10.8** — Lighthouse PWA audit ≥ 90.
- [ ] **S10.9** — Install prompt (Chrome desktop): "Install AnimalPassport" sa zobrazí; po inštalácii sa otvorí standalone okno.
- [ ] **S10.10** — Manifest icons: nie sú 404 (skontroluj v Network tab).
- [ ] **S10.11** — `offline.html` self-contained: blokuj všetky requesty v devtools → stránka sa stále vykreslí (žiadne externé fonty/CSS).

---

## S11 — Edge cases & bezpečnosť

- [ ] **S11.1** — XSS pokus v pet name (`<script>alert(1)</script>`) → render escaped v MUI Typography, nevykoná sa.
- [ ] **S11.2** — XSS pokus v episode symptomTitle, diet entry foodName, vet clinic name — všade escaped.
- [ ] **S11.3** — SQL/JSON injection v search query (`'; DROP TABLE pets;--`) → Supabase parametrizované, žiadny efekt.
- [ ] **S11.4** — Base64 attachment 6 MB → 400 server-side (klient by mal blokovať skôr).
- [ ] **S11.5** — OCR `source: 'none'` → user warning UI text, nie tichá strata dát.
- [ ] **S11.6** — Server logy pri `/api/analyze` s passport fotom: NEobsahujú base64, NEobsahujú API kľúče, NEobsahujú celý prompt s menom pet.
- [ ] **S11.7** — `Authorization` header sa nikdy nezalogoval.
- [ ] **S11.8** — Prompt injection z OCR (asset 10) → `wrapOcrForPrompt` delimitery v server logu prítomné, AI výstup neobsahuje injection efekty.
- [ ] **S11.9** — `[PROD]` HTTPS only, HSTS header (Render / Netlify default).
- [ ] **S11.10** — `[PROD]` CSP header zvážený (alebo dokumentovaný ako out-of-scope pre v1).
- [ ] **S11.11** — Žiadne `console.log` v produkčnom buildi klienta (`grep -r "console.log" client/dist`).
- [ ] **S11.12** — `npm audit --production` na serveri aj klientovi → žiadne high/critical CVEs.
- [ ] **S11.13** — Rate limit globálne 120/min: 121. req v 60s → 429.
- [ ] **S11.14** — Vstup s znakmi mimo UTF-8 (binary garbage) → 400 alebo bezpečne escape, nie 500.

---

## S12 — Sieťové / regresie / cross-browser

- [ ] **S12.1** — Chrome (latest) — všetky predošlé sekcie green.
- [ ] **S12.2** — Safari (iOS + macOS) — login, analýza, PWA install (Add to Home Screen).
- [ ] **S12.3** — Firefox — login, analýza, PWA install variant.
- [ ] **S12.4** — Mobilný layout (DevTools device emulation 375px) — žiadny horizontálny scroll, FAB neprekrýva CTA.
- [ ] **S12.5** — Dark mode toggle perzistuje (`granule-check-dark-mode`).
- [ ] **S12.6** — Slovenský diakritika v inputoch + v AI výstupoch správna (žiadny mojibake).
- [ ] **S12.7** — Browser back/forward zachová state stránok (filter v denníku, scroll position akceptovateľne).
- [ ] **S12.8** — Refresh počas POST /api/analyze (počas loaderu) → klient gracefully cleanup, nie zombie request.

---

## S13 — Acceptance sign-off (go/no-go)

Pred go-live:

- [ ] **S13.1** — Všetky sekcie S1-S12 majú aspoň 95% bodov green; failujúce body majú issue + rozhodnutie (fix-before / ship-with-known-issue).
- [ ] **S13.2** — Smoke test prebehol na **produkčnom** prostredí, nie iba lokál (login + 1× analyze + 1× create pet + 1× zdrav. pas + 1× karta vet print).
- [ ] **S13.3** — Monitoring nastavený: aspoň Render/Netlify built-in logs + uptime monitor (UptimeRobot/cron-job.org).
- [ ] **S13.4** — Rollback plán dokumentovaný: ako revertnúť na predošlú Render deploy verziu, ako revertnúť Supabase migráciu (`supabase migration down`).
- [ ] **S13.5** — Privacy / data ownership: user vie ako požiadať o zmazanie účtu (manuálne emailom alebo cez UI).
- [ ] **S13.6** — Rate limit thresholdy adekvátne pre očakávané MAU (20/min AI = 1200/hod = ~5000 unique session-bursts).
- [ ] **S13.7** — Owner aplikácie podpísal sign-off (dátum + meno).

---

## Príloha — Mapping `assetId → endpoint → očakávaný outcome`

Viď [`test-assets/README.md`](./test-assets/README.md).
