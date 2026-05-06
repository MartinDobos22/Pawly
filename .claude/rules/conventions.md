# Konvencie

## API error shape

Všetky chyby z `/api/*` musia mať tento tvar:

```json
{
  "error": {
    "message": "Človeku-čitateľná správa v slovenčine",
    "code": "OPTIONAL_MACHINE_CODE"
  }
}
```

Status kódy:
- `400` — validačná chyba (chýbajúci/zlý input)
- `401` — neautentifikovaný (zatiaľ neimplementované)
- `403` — autentifikovaný ale bez oprávnenia
- `404` — resource neexistuje
- `429` — rate limit
- `500` — neočakávaná interná chyba (nikdy neunkujte detail externej chyby používateľovi)
- `502` / `503` — externá služba (OpenAI, Vision) zlyhala

Klient **musí** kontrolovať `response.ok` a parsovať `{ error: { message } }`. `services/api.ts` to robí centrálne — používaj ho.

## OpenAI a Google Vision

- **Volania majú timeout.** Default OpenAI SDK nemá rozumný timeout — nastav explicitne (napr. 30 s pre analýzu, 10 s pre normalizáciu).
- **Token/cost guard:** pre dlhé inputy zváž truncation alebo odmietnutie request-u nad N znakov.
- **Output parsing:** AI odpovede VŽDY validuj. Ak čakáš JSON, použi `response_format: { type: "json_object" }` a obal `JSON.parse` v try/catch — vráť 502 ak parse zlyhá.
- **Žiadne PII** (mená, adresy) sa neposielajú do AI bez explicitného súhlasu používateľa.

## Logging

`server/src/utils/logger.ts` je jediný logger. Nikdy nepoužívaj `console.log` v produkčnom kóde (povolené len pre debug počas vývoja, vyhoď pred commitom).

### Čo NIKDY nelogovať

- API kľúče (`OPENAI_API_KEY`, `GOOGLE_VISION_API_KEY`) — ani omylom v error message.
- Celý `req.body` ak obsahuje base64 obrázky alebo obsiahly text — loguj len metadáta (size, type).
- Cookies, Authorization header.
- AI prompt s používateľským PII.

### Čo logovať

- Method, path, status, duration (už máš v `index.ts`).
- Error stack pri 5xx (do servera, nie do response).
- Externé API failure: name služby, status, korelované request ID.

## Komentáre v kóde

Default: žiadne. Komentár píš len keď WHY nie je zrejmé:
- Workaround pre konkrétny bug → odkaz na issue/PR.
- Skrytý invariant ktorý reader nevidí.
- Performance dôvod pre netriviálnu voľbu.

**Nikdy** komentár ktorý opisuje WHAT (`// fetch users`) — názov funkcie/premennej to musí povedať.

## Naming

- Súbory komponentov: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utility/services: `camelCase.ts`
- Typy: `PascalCase` (interface alebo type)
- Constants: `UPPER_SNAKE_CASE`
- Booleans: prefix `is/has/should` (`isLoading`, `hasError`)

## Importy (poradie)

```ts
// 1. React + lib
import { useState } from 'react';
import { Routes } from 'react-router-dom';

// 2. MUI
import { Button, Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// 3. Interné absolútne (ak by boli aliasy)
// 4. Interné relatívne
import { useAnalyze } from '../hooks/useAnalyze';
import { ScoreCard } from './ScoreCard';

// 5. Typy (oddeľ ak je veľa)
import type { Analysis } from '../types';
```
