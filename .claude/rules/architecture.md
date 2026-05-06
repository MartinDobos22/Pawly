# Architektúra

## Frontend (`client/`)

### Tok dát

```
User → Page (pages/*) → Hook (hooks/*) → Service (services/api.ts) → fetch → Backend
                                            ↑
                                       central error handling
```

### Konvencie

- **Stránky** (`pages/`): kompozícia komponentov, žiadna priama API logika — všetko cez hooky.
- **Komponenty** (`components/`): prezentačné, dostávajú dáta cez props. Žiadne `fetch`.
- **Hooky** (`hooks/`): drživa state, robí API volania, vracia `{ data, loading, error }`-ekvivalent.
- **Services** (`services/api.ts`): jediný `fetch` wrapper. Vracia parsed JSON alebo throwne `ApiError` so structured payloadom.
- **State:** lokálny `useState` + `useLocalStorage` pre perzistenciu (zatiaľ žiadny Redux/Zustand).
- **Routing:** `react-router-dom` v6+, cesty v `App.tsx`, slovenské slugy.
- **Téma:** `useTheme()` z `@mui/material/styles`. Light/dark prepína sa v `App.tsx` cez `darkMode` z localStorage.

### Pri pridávaní stránky

1. `client/src/pages/<Name>Page.tsx` — default export funkčného komponentu.
2. Route v `client/src/App.tsx`.
3. Ak treba dáta — hook v `client/src/hooks/use<Name>.ts`.
4. Ak má UI prvky znovupoužiteľné — vyextrahuj do `components/`.

## Backend (`server/`)

### Tok requestu

```
Request → CORS → express.json (15mb) → request logger → /api/<route> → service → response
                                                                     ↓
                                                                errorHandler
```

### Konvencie

- **Routes** (`routes/`): tenké — validuj input, deleguj na service, formátuj response.
- **Services** (`services/`): celá biznis logika, externé API volania (OpenAI, Vision).
- **Middleware** (`middleware/`): cross-cutting concerns. `errorHandler` je VŽDY posledný `app.use`.
- **Logger** (`utils/logger.ts`): štruktúrovaný JSON logging. Sanitizuj senzitívne dáta pred logovaním.
- **Error shape:** všetky chyby idú cez `errorHandler` a klientovi sa vrátia ako `{ error: { message, code? } }`.

### Pri pridávaní endpointu

1. `server/src/routes/<resource>.ts` — exportuj express Router.
2. `app.use('/api/<resource>', <router>)` v `server/src/index.ts`.
3. Biznis logiku do `server/src/services/<Service>.ts`, route ju len volá.
4. Ak volá externú službu (OpenAI/Vision) — wrapper s `try/catch` ktorý prehodí na `errorHandler`-friendly chybu (status 502 ak external fail).
5. Pridaj typy do `server/src/types/`.

## Komunikácia klient ↔ server

- Vývojový proxy: Vite forwarduje `/api/*` na `http://localhost:3001` (alebo absolútna URL v env).
- CORS allowlist: localhost + production origin (kontroluj `server/src/index.ts`).
- JSON body limit 15 MB (kvôli base64 obrázkom — pozri komentár v `index.ts`).
- Klient používa `services/api.ts` wrapper, nie raw `fetch`.
