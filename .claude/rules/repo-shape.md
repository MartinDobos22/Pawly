# Repo shape

```
AnimalPassport/
├── client/                          # Frontend
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   ├── sw.js                    # Service Worker (CACHE_NAME verzuj!)
│   │   ├── offline.html             # Offline fallback
│   │   └── icons/                   # 192, 512
│   ├── src/
│   │   ├── main.tsx                 # Entry, registruje SW
│   │   ├── App.tsx                  # Theme provider + Router
│   │   ├── theme.ts                 # MD3 light + dark, JEDINÉ MIESTO PRE FARBY
│   │   ├── components/              # Reusable UI (PascalCase.tsx)
│   │   ├── pages/                   # Route-level komponenty
│   │   ├── hooks/                   # Custom hooky (useFoo.ts)
│   │   ├── services/                # API klienti (api.ts wraps fetch)
│   │   ├── utils/                   # Čisté helpery
│   │   └── types/                   # Zdielané TS typy
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
├── server/                          # Backend
│   ├── src/
│   │   ├── index.ts                 # Express bootstrap
│   │   ├── routes/                  # Route handlery (analyze.ts)
│   │   ├── services/                # AI / OCR / business logika
│   │   ├── middleware/              # errorHandler, atď.
│   │   ├── utils/                   # logger, helpery
│   │   └── types/                   # Zdielané TS typy
│   ├── tsconfig.json
│   └── package.json
├── docs/                            # Produktové dokumenty (.md)
├── .claude/                         # Pravidlá, skills, agenti, hooks, settings
├── .github/workflows/               # CI
├── CLAUDE.md                        # Hlavný systémový prompt
└── README.md
```

## Kde čo pridať

| Čo pridávaš | Kam |
|---|---|
| Nový API endpoint | `server/src/routes/<resource>.ts`, registruj v `server/src/index.ts` |
| Nová biznis služba (server) | `server/src/services/<Service>.ts` |
| Nová UI stránka | `client/src/pages/<Name>Page.tsx`, route v `App.tsx` |
| Reusable UI komponent | `client/src/components/<Name>.tsx` |
| Hook pre data/štát | `client/src/hooks/use<Name>.ts` |
| API call wrapper | rozšír `client/src/services/api.ts` alebo pridaj nový file |
| Zdieľaný typ klient↔server | duplikuj v `client/src/types/` aj `server/src/types/` (zatiaľ nie je shared package) |
| Env premenná | `.env` (lokálne), zdokumentuj v `.claude/rules/env-vars.md` a `README.md` |

## Čo NIE je súčasť repo (a nepridávaj bez explicitnej úlohy)

- `node_modules/` — gitignored
- `dist/`, `build/` — build outputy, gitignored
- `.env`, `.env.local` — secrets, NIKDY nekomituj
- Lock súbory iné než `package-lock.json` (žiadny pnpm/yarn)
