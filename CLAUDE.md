# AnimalPassport — projektové konvencie

Tento súbor je systémový prompt pre Claude Code v tomto repozitári. Pred každou úlohou sa automaticky načíta.

## Stack

- **Klient:** React 18 + TypeScript + Material UI 6 (MD3) + Vite + PWA (Service Worker, manifest, offline fallback)
- **Server:** Node.js + Express + TypeScript, OpenAI SDK, Google Vision API
- **Cieľ:** produkčné nasadenie na web (PWA-ready)

## Domény (čo aplikácia robí)

1. **Analýza krmiva** (`/`) — text alebo PDF/foto → AI vráti skóre + ingrediencie + allergen warnings voči profilu zvieraťa.
2. **Profily zvierat** (`/profily`) — pet profil (alergie, intolerancie, zdravotné stavy, …).
3. **Zdravotný pas** (`/zdravotny-pas`) — vakcinácie, odčervenie, ektoparazity, chronické stavy. AI import z fotenej karty.
4. **Denník epizód** (`/dennik`) — zdravotné epizódy s AI "similar summary" zo súvisiacich minulých záznamov.
5. **Karta pre veterinára** (`/karta-pre-veterinara`) — print-ready súhrn.
6. **História analýz** (`/historia`).

Detaily v `.claude/rules/health-passport.md`.

## Štruktúra repozitára

```
client/   # Frontend (Vite + React + MUI)
server/   # Backend (Express + TS)
docs/     # Produktové dokumenty
.claude/  # Pravidlá, skills, agenti, hooks
.github/  # CI workflows
```

## Tvrdé pravidlá pre kód

### TypeScript

- **Nikdy** `any`. Ak je typ neznámy, použi `unknown` a zúž ho.
- Každý React komponent má **`Props` interface** (alebo `type Props`).
- `tsconfig` strict mode je zapnutý — neignoruj chyby `tsc`.
- Žiadne `// @ts-ignore` bez vysvetľujúceho komentára nad ním.

### MUI a téma

- **Vždy** používaj theme tokeny: `theme.palette.*`, `theme.spacing()`, `theme.shape.borderRadius`, `theme.typography.*`.
- **Nikdy** raw hex farby (`#1B5E20`, `#fff`) v komponentoch — patria len do `client/src/theme.ts`.
- **Nikdy** magic numbers v `sx` prop pre spacing — používaj `theme.spacing(n)` alebo MUI spacing prop.
- Statické štýly mimo `sx` rieš cez `styled()` z `@mui/material/styles`, nie inline objekty.
- Ikony: `@mui/icons-material`, **nie emoji** v UI (emoji povolené len v používateľskom obsahu).

### React

- Žiadne zbytočné re-rendery — zváž `useMemo`/`useCallback` pre drahé výpočty alebo callbacky odovzdávané do memoizovaných detí.
- Custom hooky v `client/src/hooks/`, jeden hook = jeden súbor.
- Routovanie cez `react-router-dom`, cesty v slovenčine (`/profily`, `/historia`, `/zdravotny-pas`).

### Backend

- Každý API endpoint vracia chybu vo formáte `{ error: { message: string, code?: string } }`.
- **Žiadna** ručná konkatenácia hodnôt do reťazcov ktoré sa posielajú externým službám alebo do logov bez sanitizácie.
- Tajomstvá výhradne cez `process.env.*`. Žiadny secret v kóde, ani v testoch.
- Externé volania (OpenAI, Google Vision) majú **timeout** a zachytenú chybu vracajú ako 502/503, nie 500.
- Logger (`server/src/utils/logger.ts`) **nikdy** neloguje API kľúče, base64 telá obrázkov, ani celý `req.body`.

### PWA

- `client/public/sw.js` — pri zmene aktívov **vždy** zvýš `CACHE_NAME` verziu, inak používatelia uvidia starú verziu.
- `client/public/manifest.json` — meno, ikony 192/512, `start_url`, `display: standalone`.
- `client/public/offline.html` — fallback musí byť self-contained (žiadne externé fonty/CSS).

## Konvencie kódu

- **Komentáre:** default žiadne. Komentár píš len keď WHY nie je zrejmé z mena. Žiadne TODO ktoré nereferencujú issue/úlohu.
- **Naming:** súbory komponentov `PascalCase.tsx`, hooks `useCamelCase.ts`, utility `camelCase.ts`.
- **Importy:** najprv react/library, potom MUI, potom interné `./` a `../`.
- **Formát:** Prettier (auto-format hookom pri Write/Edit ak je nainštalovaný).

## Workflow

- Vývoj prebieha na `claude/<úloha>` branchoch odvodených od `main`.
- Branch guard hook automaticky vytvorí branch ak píšeš na `main`.
- Pre väčšie úlohy spusti `/implement <popis>` — pipeline: Clarify → Explore → Plan → Implement → Test → Review → Security review (server) → Fix → Summary.

## Čo NIE je v projekte (zatiaľ)

- Žiadna databáza — história sa drží v `localStorage` na klientovi.
- Žiadna autentifikácia.
- Žiadne unit/E2E testy (CI má `--passWithNoTests`-ekvivalent placeholder).
- Žiadny ESLint — `tsc --noEmit` slúži ako lint.

Ak pridávaš jednu z týchto vecí, urob to ako samostatnú úlohu cez `/implement`, nie ako side-effect.
