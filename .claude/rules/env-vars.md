# Environment premenné

## Server (`server/.env`)

| Premenná | Povinná | Default | Popis |
|---|---|---|---|
| `PORT` | nie | `3001` | Port Express servera |
| `OPENAI_API_KEY` | áno (na analýzu) | — | Kľúč pre OpenAI API |
| `GOOGLE_VISION_API_KEY` | áno (na OCR) | — | Kľúč pre Google Vision API |
| `NODE_ENV` | nie | `development` | `production` v deployi |
| `CORS_ORIGIN` | odporúčané v prod | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed originy. `server/src/index.ts` ich reálne číta (split podľa `,`); ak premenná chýba, fallbackne na localhost. V prod (Render) nastav na Netlify URL **bez** koncového `/`. |
| `FIREBASE_PROJECT_ID` | áno (auth) | — | Firebase projekt ID (Service Account). |
| `FIREBASE_CLIENT_EMAIL` | áno (auth) | — | Service Account client email. |
| `FIREBASE_PRIVATE_KEY` | áno (auth) | — | Service Account privátny kľúč; novelines ako `\n` v úvodzovkách (`config/firebase.ts` ich nahradí). Z Firebase Console → Project Settings → Service Accounts → Generate new private key. |
| `SUPABASE_URL` | áno (DB) | — | URL Supabase projektu. Z Supabase Dashboard → Project Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | áno (DB) | — | **TAJOMSTVO** — service_role kľúč (obchádza RLS). Výhradne server-side, NIKDY do klienta. Z Supabase Dashboard → Project Settings → API. Číta `config/supabase.ts`. |

> **Supabase premenné sú povinné pre DB.** `server/src/config/supabase.ts` fail-fastne ak `SUPABASE_URL` alebo `SUPABASE_SERVICE_ROLE_KEY` chýba. service_role kľúč obchádza RLS — autorizácia sa vynucuje v API vrstve (scope na `req.appUserId` cez `middleware/ensureUser.ts`).

> **Auth premenné sú povinné.** `server/src/config/firebase.ts` fail-fastne pri prvom overení tokenu ak ktorákoľvek `FIREBASE_*` chýba. Všetky `/api/*` endpointy okrem `/api/health` overujú Firebase ID token cez `middleware/firebaseAuth.ts`.

## Klient (`client/.env`)

Vite env premenné MUSIA mať prefix `VITE_` aby boli dostupné v kóde.

| Premenná | Povinná | Default | Popis |
|---|---|---|---|
| `VITE_API_URL` | nie (dev) | `''` (relatívne, cez Vite proxy na `:3001`) | Plná base URL pre API v produkcii (napr. `https://api.example.com`). Konzumuje sa v `client/src/services/api.ts`. |
| `VITE_FIREBASE_API_KEY` | áno (auth) | — | Firebase Web App apiKey. |
| `VITE_FIREBASE_AUTH_DOMAIN` | áno (auth) | — | Firebase authDomain (`<projekt>.firebaseapp.com`). |
| `VITE_FIREBASE_PROJECT_ID` | áno (auth) | — | Firebase projekt ID. |
| `VITE_FIREBASE_STORAGE_BUCKET` | nie | — | Firebase storage bucket. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | nie | — | Firebase messaging sender ID. |
| `VITE_FIREBASE_APP_ID` | áno (auth) | — | Firebase Web App appId. Z Firebase Console → Project Settings → Your apps → Web app → SDK config. |
| `VITE_STRIPE_PAYMENT_LINK` | nie | prázdne (feature skrytá) | URL Stripe Payment Linku pre dobrovoľný donate (Fáza 0 monetizácie). Vytvor v Stripe Dashboard → Payment Links. Konzumuje sa v `Layout.tsx` a `AboutPage.tsx`. Ak nie je nastavená, "Podporiť projekt" UI prvky sa nezobrazia. |

> **Konvencia:** premenná sa volá `VITE_API_URL`, nie `VITE_API_BASE_URL`. Ak ju premenuješ v kóde, updatni aj túto tabuľku, README a `.env.example`.

## Pravidlá

- **NIKDY** necommituj `.env` (musí byť v `.gitignore`).
- Pridaj `.env.example` ako šablónu pre nových developerov (bez hodnôt).
- Server: čítaj env len v `index.ts` alebo dedikovanom `config.ts`. Nepoužívaj `process.env.X` rozsypané po celom kóde.
- Klient: prístup cez `import.meta.env.VITE_*`.
- Feature flag pre nepripravené veci: ak pridáš novú externú službu, zabaľ použitie do `isXEnabled()` checku ktorý vráti false ak chýba kľúč.

## Pri pridávaní novej env premennej

1. Pridaj do `.env.example`.
2. Zdokumentuj v tejto tabuľke.
3. Validuj prítomnosť pri starte servera ak je povinná (fail-fast).
4. Klient: prefix `VITE_`, inak Vite ju nezachytí.

## Dev vs Prod (Supabase)

`SUPABASE_SERVICE_ROLE_KEY` obchádza RLS. Mať ho lokálne pre **produkčný** projekt je najčastejší zdroj leakov (commit do gitu, screen share, ukradnutý laptop). Preto:

1. Vytvor druhý Supabase projekt `animalpassport-dev` (Free tier stačí na dev).
2. Spusti všetky migrácie z `supabase/migrations/` na dev projekte v poradí 0001 → 0008+ cez Supabase SQL editor.
3. V lokálnom `server/.env` použi **dev** `SUPABASE_URL` a `SUPABASE_SERVICE_ROLE_KEY`.
4. Produkčný `SUPABASE_SERVICE_ROLE_KEY` drž **výhradne** v Render env premenných. Nikdy nie v lokálnom `.env`, v žiadnom CI logu, v PR komentári.
5. Pri rotácii prod kľúča (po incidente alebo plánovanej rotácii): Supabase Dashboard → Settings → API → Reset service_role → updatni Render → redeploy.

Backup checklist a postup pri leaku: `docs/security-checklist.md`.
