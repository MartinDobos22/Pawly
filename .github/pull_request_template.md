## Zhrnutie

<!-- 1–3 odrážky: čo táto PR robí a prečo. -->

## Dotknuté oblasti

- [ ] `client/` (UI, hooks, services, types)
- [ ] `server/` (routes, services, middleware)
- [ ] PWA (`client/public/sw.js`, `manifest.json`, `offline.html`)
- [ ] `.claude/` (pravidlá, skills, agenti, hooks, settings)
- [ ] `.github/` (CI, templates)
- [ ] `docs/`

## Checklist

- [ ] `npm run type-check` prejde na zmenených modulu (client/server)
- [ ] `npm run build` prejde
- [ ] Žiadne raw hex farby mimo `client/src/theme.ts`
- [ ] Žiadne `any` (alebo s `// @ts-ignore` + dôvod)
- [ ] API endpointy vracajú `{ error: { message, code? } }`
- [ ] AI/OCR endpointy sú za `aiHeavyLimiter`
- [ ] Pri zmene assetov v `client/public/` je `CACHE_VERSION` v `sw.js` bumpnuté
- [ ] Žiadne `console.log` v produkčnom kóde; logger.ts ne-loguje secrets ani celý `req.body`
- [ ] OCR text vložený do AI promptu prešiel cez `wrapOcrForPrompt`
- [ ] Zdielané typy klient↔server sú updatnuté na oboch stranách

## Test plan

<!-- Bodový zoznam manuálnych krokov / scenárov. -->
