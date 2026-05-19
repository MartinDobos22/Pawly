# Environment premenné

## Server (`server/.env`)

| Premenná | Povinná | Default | Popis |
|---|---|---|---|
| `PORT` | nie | `3001` | Port Express servera |
| `OPENAI_API_KEY` | áno (na analýzu) | — | Kľúč pre OpenAI API |
| `GOOGLE_VISION_API_KEY` | áno (na OCR) | — | Kľúč pre Google Vision API |
| `NODE_ENV` | nie | `development` | `production` v deployi |
| `CORS_ORIGIN` | odporúčané v prod | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed originy. **POZOR:** `server/src/index.ts` má aktuálne hardcoded `['http://localhost:5173','http://127.0.0.1:5173']` — pri deploy treba premennú reálne čítať, inak CORS error. |

## Klient (`client/.env`)

Vite env premenné MUSIA mať prefix `VITE_` aby boli dostupné v kóde.

| Premenná | Povinná | Default | Popis |
|---|---|---|---|
| `VITE_API_URL` | nie (dev) | `''` (relatívne, cez Vite proxy na `:3001`) | Plná base URL pre API v produkcii (napr. `https://api.example.com`). Konzumuje sa v `client/src/services/api.ts`. |

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
