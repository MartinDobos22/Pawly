# Pawly – Digitálny zdravotný pas a analýza krmiva pre domáce zvieratá 🐾

Pawly je PWA aplikácia, ktorá drží zdravotnú agendu tvojho miláčika na jednom mieste a pomáha ti rozhodovať sa o jeho strave. Vieš si viesť **profily zvierat**, **zdravotný pas** (očkovania, odčervenia, ošetrenia proti parazitom, chronické stavy), **denník zdravotných epizód**, pripraviť **kartu pre veterinára** na tlač a nechať si AI **vyhodnotiť zloženie krmiva** voči alergiám konkrétneho zvieraťa. Zdravotnú kartu alebo výsledky vyšetrení môžeš odfotiť/nahrať ako PDF a AI z nich vytiahne štruktúrované záznamy (OCR).

## Technológie

| Vrstva        | Technológie                                                               |
| ------------- | ------------------------------------------------------------------------- |
| **Frontend**  | React 18, TypeScript, Material UI 6 (MD3), Vite, react-i18next (SK/EN)    |
| **Backend**   | Node.js, Express, TypeScript                                              |
| **AI / OCR**  | OpenAI SDK, Google Vision API                                             |
| **Auth**      | Firebase Authentication (ID token na každom `/api/*` okrem `/api/health`) |
| **Databáza**  | Supabase (PostgreSQL, RLS deny-by-default, prístup len cez backend)       |
| **PWA**       | Service Worker, Web App Manifest, offline fallback                        |
| **Nasadenie** | Netlify (frontend) + Render (backend)                                     |

> Pôvodný projekt „GranuleCheck" sa rozrástol z čistej analýzy granúl na celú zdravotnú agendu. História návrhu je v `docs/dog-health-modules-design.md`.

## Funkcie a routy (SK slugy)

| Route                                          | Stránka                         | Doména                                                    |
| ---------------------------------------------- | ------------------------------- | --------------------------------------------------------- |
| `/analyza`                                     | `AnalyzePage`                   | Analýza krmiva (text alebo PDF/foto) + food-safety otázky |
| `/profily`                                     | `PetProfilePage`                | Profily zvierat (alergie, intolerancie, zdravotné stavy)  |
| `/zdravotny-pas/*`                             | `HealthPassportPage`            | Zdravotný pas + AI import z fotenej karty                 |
| `/dennik`                                      | `EpisodeDiaryPage`              | Denník epizód + AI zhrnutie podobných minulých záznamov   |
| `/karta-pre-veterinara`                        | `VetCardPage`                   | Print-ready (A4) súhrn pre veterinára                     |
| `/historia`                                    | `HistoryPage`                   | História uložených analýz                                 |
| `/notifikacie`                                 | `NotificationsPage`             | Pripomienky (očkovania, odčervenia, …)                    |
| `/nastavenia`, `/info`, `/kontakt`, `/podpora` | `Settings/Info/Contact/Support` | Nastavenia, FAQ, kontakt, podpora projektu                |

Verejné (bez prihlásenia): `/` (landing), `/login`, `/register`, `/overenie-emailu`, `/reset-hesla`, `/ochrana-sukromia`.

## API endpointy (`server/src/routes/`)

`analyze`, `episodes`, `extract-text`, `interpret-passport`, `food-safety`, `health`, `pets`, `account`, `notifications`, `cron`, `authEmails`. AI/OCR endpointy bežia za per-IP rate limitom (`aiHeavyLimiter`) aj per-user denným capom (`requireAiQuota`).

## Štruktúra projektu

```
Pawly/
├── client/                 # Frontend (Vite + React 18 + MUI 6 + PWA)
│   ├── public/             # manifest.json, sw.js, offline.html, icons/
│   └── src/
│       ├── pages/          # Route-level stránky
│       ├── components/     # Reusable UI (episodes/, healthPassport/, vetCard/, landing/, …)
│       ├── hooks/          # Custom hooky (jeden hook = jeden súbor)
│       ├── contexts/       # PetProfilesContext, HealthDataContext, Auth
│       ├── services/       # API klienti (api.ts, dogHealthApi.ts, petsApi.ts, healthApi.ts)
│       ├── locales/        # i18n preklady (sk/, en/)
│       └── theme.ts        # MD3 light + dark — jediné miesto pre farby
├── server/                 # Backend (Express + TS)
│   └── src/
│       ├── routes/         # API endpointy
│       ├── services/       # AI/OCR/business logika (aiService, episodeAiService, …)
│       ├── middleware/     # firebaseAuth, ensureUser, aiQuota, errorHandler (vždy posledný)
│       ├── config/         # firebase.ts, supabase.ts
│       └── utils/          # logger, sanitizeOcrText, …
├── supabase/migrations/    # SQL migrácie (0001 → …)
├── docs/                   # Produktové a prevádzkové dokumenty
├── netlify.toml            # Frontend deploy (Netlify)
├── render.yaml             # Backend deploy (Render)
└── .claude/                # Projektové pravidlá, skills, agenti, hooks
```

## Inštalácia a spustenie

### Predpoklady

- **Node.js 20 LTS**, **npm 9+**
- Účty/kľúče pre: OpenAI, Google Vision, Firebase (Auth) a Supabase (DB)

### 1. Inštalácia závislostí

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Konfigurácia premenných prostredia

Vytvor `server/.env` a `client/.env` podľa `.claude/rules/env-vars.md`. Minimum:

```env
# server/.env
OPENAI_API_KEY=...
GOOGLE_VISION_API_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

```env
# client/.env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
# VITE_API_URL=  # prázdne v dev → Vite proxy na :3001
```

> **NIKDY** necommituj `.env`. `SUPABASE_SERVICE_ROLE_KEY` obchádza RLS — v lokálnom `.env` používaj **dev** Supabase projekt, nie produkčný. Detaily v `.claude/rules/env-vars.md` a `docs/security-checklist.md`.

### 3. Databáza (Supabase)

Spusti migrácie z `supabase/migrations/` v poradí cez Supabase SQL editor.

### 4. Vývojový server

```bash
# Terminál 1 – Backend (port 3001)
cd server && npm run dev

# Terminál 2 – Frontend (port 5173)
cd client && npm run dev
```

Aplikácia beží na **http://localhost:5173**, API na **http://localhost:3001** (Vite proxuje `/api/*`).

### Užitočné skripty

| Príkaz               | Účel                               |
| -------------------- | ---------------------------------- |
| `npm run build`      | Produkčný build (client aj server) |
| `npm run type-check` | `tsc --noEmit` (slúži aj ako lint) |

## PWA

Pri zmene statických aktív (manifest, ikony, app shell) **vždy zvýš `CACHE_VERSION`** v `client/public/sw.js`, inak používatelia uvidia starú verziu. `offline.html` musí byť self-contained (žiadne externé fonty/CSS). SW sa registruje len v produkcii.

## Nasadenie

- **Frontend → Netlify** (`netlify.toml`): base `client`, build `npm run build`, publish `dist`, SPA fallback na `index.html`.
- **Backend → Render** (`render.yaml`): rootDir `server`, healthcheck `/api/health`. Premenné (`OPENAI_API_KEY`, `SUPABASE_*`, `FIREBASE_*`, `CORS_ORIGIN`, …) nastav v Render dashboard — `sync: false`, nikdy v repo.
- **Notifikácie:** denný cron (cron-job.org) volá `POST /api/cron/notifications` s hlavičkou `x-cron-secret`. Postup v `docs/cron-notifications-setup.md`.

## Dokumentácia

- `.claude/rules/` — záväzné projektové konvencie (architektúra, PWA, env premenné, zdravotný pas, …)
- `docs/dog-health-modules-design.md` — návrh dátového modelu zdravotného pasu
- `docs/security-checklist.md` — bezpečnosť, backup, postup pri leaku kľúča
- `docs/cron-notifications-setup.md` — nastavenie notifikačného cronu
- `docs/launch-test-plan.md` — testovací plán pred spustením
