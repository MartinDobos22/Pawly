# Architektúra

## Frontend (`client/`)

### Tok dát

```
User → Page (pages/*) → Hook (hooks/*) → Service (services/api.ts | dogHealthApi.ts) → fetch → Backend
                                                              ↑
                                                  central error parsing (ApiError shape)
```

### Konvencie

- **Stránky** (`pages/`): kompozícia komponentov, žiadna priama API logika — všetko cez hooky.
- **Komponenty** (`components/`): prezentačné, dostávajú dáta cez props. Žiadne `fetch`.
  - Doménové subadresáre: `components/episodes/`, `components/healthPassport/`, `components/vetCard/`. Globálne komponenty (Layout, ScoreCard, …) sú v rooti `components/`.
- **Hooky** (`hooks/`): držia state, robia API volania, vracajú `{ data, loading, error }`-ekvivalent.
- **Services** (`services/`): jediný `fetch` wrapper na doménu — `api.ts` pre analýzu/epizódy/OCR, `dogHealthApi.ts` pre zdravotný pas. Vracia parsed JSON alebo `throw new Error(message)` so správou z `{ error: { message } }`.
- **State:** lokálny `useState` + `useLocalStorage` pre perzistenciu (žiadna DB, žiadny Redux/Zustand).
- **Routing:** `react-router-dom` v6+, cesty v `App.tsx`, slovenské slugy (`/profily`, `/historia`, `/zdravotny-pas`, `/karta-pre-veterinara`, `/dennik`, `/o-aplikacii`).
- **Téma:** `useTheme()` z `@mui/material/styles`. Light/dark prepína sa v `App.tsx` cez `darkMode` z localStorage.
- **Logger:** `client/src/utils/logger.ts` — produkčný kód nepoužíva `console.log` (povolené len ako dočasné debug).

### Pri pridávaní stránky

1. `client/src/pages/<Name>Page.tsx` — default export funkčného komponentu.
2. Route v `client/src/App.tsx` (SK slug).
3. Ak treba dáta — hook v `client/src/hooks/use<Name>.ts`.
4. Ak má UI prvky znovupoužiteľné — vyextrahuj do `components/` (alebo doménového subadresára).
5. Ak pridáva nový API call — rozšír existujúci `*Api.ts` v `services/`, alebo založ nový.

## Backend (`server/`)

### Tok requestu

```
Request → CORS → express.json (15mb) → request logger
        → globalLimiter (120/min)
        → [aiHeavyLimiter (20/min) ak AI endpoint]
        → /api/<route> → service → response
                              ↓
                         errorHandler  →  { error: { message, code? } }
```

### Konvencie

- **Routes** (`routes/`): tenké — validuj input, deleguj na service, formátuj response. Žiadne externé API volania priamo v route handleri.
- **Services** (`services/`): celá biznis logika, externé API volania (OpenAI, Google Vision).
- **Middleware** (`middleware/`): cross-cutting concerns. `errorHandler` je **VŽDY posledný** `app.use`.
- **Rate limiting:** dve úrovne, oboje v `server/src/index.ts`:
  - `globalLimiter` (120 req/min na celý `/api/`)
  - `aiHeavyLimiter` (20 req/min) — pripoj k AI endpointom: `app.use('/api/<resource>', aiHeavyLimiter, router)`.
- **Logger** (`utils/logger.ts`): štruktúrovaný JSON. Sanitizuj senzitívne dáta (base64, API kľúče, celý req.body) PRED logovaním.
- **Error shape:** všetky chyby idú cez `errorHandler` a klientovi sa vrátia ako `{ error: { message, code? } }`.
- **OCR sanitizácia:** OCR text vložený do AI promptu musí prejsť cez `utils/sanitizeOcrText.ts` (chráni pred prompt injection z užívateľského PDF).

### Pri pridávaní endpointu

1. `server/src/routes/<resource>.ts` — exportuj express Router.
2. `app.use('/api/<resource>', <router>)` v `server/src/index.ts`.
3. **Ak volá AI/OCR**, daj pred router `aiHeavyLimiter`: `app.use('/api/<resource>', aiHeavyLimiter, router)`.
4. Biznis logiku do `server/src/services/<Service>.ts`, route ju len volá.
5. Ak volá externú službu (OpenAI/Vision) — wrapper s `try/catch` a explicitným `timeout` (30 s analýza, 10 s normalizácia), prehodí na `errorHandler`-friendly chybu (status 502 ak external fail).
6. Pridaj typy do `server/src/types/` (a duplikuj na klientovi v `client/src/types/`).

### Doménové services (aktuálne)

| Service | Účel |
|---|---|
| `aiService.ts` | `callAiModel` (OpenAI wrapper s system promptom pre analýzu krmiva), `extractTextFromAttachment` (OCR fallback ladder) |
| `episodeAiService.ts` | Similar-summary generátor pre `/api/episodes/similar-summary` |
| `examAlias.ts` | Mapa veterinárnych skratiek (USG, RTG, EKG, PPT, …) → kanonický typ vyšetrenia |
| `examAliasPrompts.ts` | Prompt templates podľa typu vyšetrenia |
| `examType.ts` | Detekcia typu vyšetrenia z OCR textu |

## Komunikácia klient ↔ server

- Vývojový proxy: Vite forwarduje `/api/*` na `http://localhost:3001` (alebo absolútna URL v `VITE_API_URL`).
- CORS allowlist: aktuálne hardcoded v `server/src/index.ts` (`localhost:5173`, `127.0.0.1:5173`). Production deployment musí umiestniť allowlist do env (`CORS_ORIGIN`).
- JSON body limit 15 MB (base64 obrázky napúchajú ~33 %; UI obmedzuje upload na 5 MB).
- Klient používa wrappery v `services/`, nie raw `fetch`.

## Perzistencia

- **Supabase (Postgres)** je hlavná perzistencia pre používateľské dáta — cez **backend** (service_role, nikdy nie z klienta). Tabuľky: `users`, `pets`, a zdravotné záznamy (`vaccinations`, `dewormings`, `ectoparasites`, `vet_visits`, `medications`, `medication_dose_logs`, `diet_entries`, `expenses`, `health_episodes`, `saved_analyses`). Migrácie v `supabase/migrations/`.
  - Frontend pristupuje cez kontexty/hooky: `usePetProfiles` (profily) a `useHealthData` (zdravotné záznamy + história analýz). Tieto volajú `services/petsApi.ts` a `services/healthApi.ts`. Žiadny health stav už nie je v localStorage.
  - Bezpečnosť: každý dotaz je scopnutý na vlastníka (`user_id` / vlastníctvo petu cez `pet_id`); RLS je deny-by-default. `pet_id` má `ON DELETE CASCADE` — zmazaním zvieraťa sa zmažú jeho záznamy na serveri.
- **`localStorage`** drží už len **lokálne preferencie/cache zariadenia** (nie medicínske dáta): `granule-check-dark-mode`, `granule-check-active-pet-id`, `granule-check-last-clinic-by-dog`, `dog-health-weight-logs` (zatiaľ — kandidát na migráciu), recent food-safety queries.
- `useLocalStorage<T>(key, default)` ostáva generický hook pre tieto preferencie.
- Cieľový dátový model: `docs/dog-health-modules-design.md`. Pri zmene tvaru záznamu uprav SQL migráciu, server mapper (`server/src/services/healthMappers.ts`) **aj** klientské typy.
