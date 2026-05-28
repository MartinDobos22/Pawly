---
name: implement
description: Štruktúrovaná pipeline pre implementáciu úlohy v AnimalPassport — Clarify → Explore → Plan → Implement → Test → Review → (Security review pri server zmenách) → Fix → Summary. Spúšťaj keď používateľ napíše /implement <popis úlohy>.
---

# /implement — implementačná pipeline

Tvoja úloha: priviesť požiadavku používateľa od textu k otestovanému, zreviewovanému kódu na feature branchi. Postupuj cez fázy. **Dva STOP body si vyžadujú explicitný súhlas používateľa** pred pokračovaním.

Vstup používateľa: `$ARGUMENTS` (popis úlohy).

---

## FÁZA 0 — CLARIFY

Spawni **task-clarifier** subagent (`subagent_type: "task-clarifier"`).

Cieľ: zdokonaliť vágnu požiadavku na konkrétnu špecifikáciu. Subagent prečíta relevantné súbory a vráti:

```
### Pôvodná požiadavka
### Zdokonalená špecifikácia
### Otázky (ak sú nejasnosti)
### Predpoklady
```

🛑 **STOP.** Predlož výstup používateľovi a počkaj na potvrdenie alebo úpravu. **Nepokračuj** bez súhlasu.

---

## FÁZA 0.5 — BRANCH SETUP

Pred implementáciou over branch:

1. `git rev-parse --abbrev-ref HEAD`
2. Ak si na `main`:
   - `git fetch origin main && git pull origin main`
   - `git checkout -b mdobos/<slug-z-úlohy>` (kebab-case, max 50 znakov)
3. Ak si na `mdobos/*` branchi → zostaň, žiadne git operácie.
4. Edge case: ak si na inej branchi než `main` alebo `mdobos/*` → spýtaj sa používateľa.

(Branch guard hook tiež toto rieši ako bezpečnostnú sieť.)

---

## FÁZA 1 — EXPLORE

Spawni **explorer** subagent (`subagent_type: "Explore"` ak existuje, inak general-purpose s read-only inštrukciou).

Cieľ: zmapovať kódovú bázu pre danú oblasť. Vráti:

```
## Relevantné súbory   — cesta + 1-vetový popis
## Existujúce patterns — hooky/komponenty/utility na znovupoužitie
## Závislosti          — čo závisí na čom
## Upozornenia         — pasce, invarianty (napr. CACHE_NAME bump pri zmene SW)
```

---

## FÁZA 2 — PLAN

**Hlavný Claude** (nie subagent) na základe Explore výstupu napíše:

```
### Plán: <názov úlohy>

**Scope**
- Zmenené súbory: ...
- Nové súbory: ...

**Kroky**
1. ... (jednoduchý / stredný / zložitý)
2. ...

**Riziká**
- breaking changes, PWA cache, externé API, ...

**Testy**
- aké type-checky / manuálne kroky overia funkčnosť
```

🛑 **STOP.** Predlož plán používateľovi. Ak odmietne → prepracuj. Ak potvrdí → pokračuj.

---

## FÁZA 3 — IMPLEMENT

Implementuj podľa schváleného plánu. **Hard rules** (vynucované počas písania):

- `useTheme()` z `@mui/material/styles` namiesto importu `lightTheme`/`darkTheme` priamo
- `theme.palette.*`, `theme.spacing()`, `theme.shape.*`, `theme.typography.*` — **žiadne raw hex farby** mimo `client/src/theme.ts`
- Žiadne magic numbers v `sx` pre spacing → `theme.spacing(n)` alebo MUI spacing prop
- Každý komponent má `Props` interface
- Žiadny `any`
- Žiadne emoji ikony v UI — `@mui/icons-material`
- Backend: každý endpoint volá errorHandler-friendly throw, nie `res.status(500)` priamo
- Pri zmene `client/public/sw.js` alebo aktív v `public/` → bump `CACHE_NAME`
- API error shape: `{ error: { message, code? } }` všade

### Hooks bežia automaticky

- **PostToolUse `post-write-prettier.cjs`** po každom Write/Edit → auto-format súboru cez Prettier (silently skip ak nie je nainštalovaný).
- **PreToolUse `pre-tool-branch-guard.cjs`** pred každým Write/Edit → vytvorí branch ak si na `main`.

---

## FÁZA 4 — TEST

Spusti type-check + test podľa toho čo bolo zmenené:

```
client/ zmeny  → cd client && npm run type-check && npm test
server/ zmeny  → cd server && npm run type-check && npm test
oboje          → spusti oba paralelne v jednom Bash bloku
```

Ak zlyhá → analyzuj, oprav, znova spusti. **Nepokračuj** kým type-check + testy neprejdú čisto.

(Stop hook `stop-test-gate.cjs` to ešte raz overí pri end-of-turn.)

---

## FÁZA 5 — CODE REVIEW

Spawni **code-reviewer** subagent (`subagent_type: "code-reviewer"`).

Subagent kontroluje:

| Kategória | Čo |
|---|---|
| Design system | raw hex farby, magic numbers, emoji ikony, missing `Props` |
| TypeScript | `any` typy, missing types, navigation/route param typing |
| React | zbytočné re-rendery, kľúče v listoch, missing memo kde treba |
| MUI | `sx` vs `styled`, theme tokeny, `useTheme` použitie |
| PWA | `CACHE_NAME` bump, manifest validnosť, offline fallback self-contained |
| Konzistencia | naming, import poradie, súlad s existujúcimi pattern |
| Edge cases | loading/error/empty states, null safety, ApiError handling |

Výstup: 🔴 Critical / 🟡 Warning / 🟢 Info → ✅ PASS alebo ❌ NEEDS FIXES.

---

## FÁZA 5b — SECURITY REVIEW (len ak sa menilo `server/`)

Spawni **security-reviewer** subagent (`subagent_type: "security-reviewer"`).

Kontroly:

| Kategória | Čo |
|---|---|
| Auth/authz | endpoint nepúšťa anonymné mutácie ak má; žiadne `req.body.userId` ako autorita |
| Input validácia | každý route handler validuje `req.body` predtým než sa dotkne service |
| Injekcie | žiadna ručná SQL konkatenácia (zatiaľ bez DB); žiadne `eval`, `Function()`, `child_process` z user inputu |
| Senzitívne dáta | API kľúče len cez `process.env`, nikdy nie v logu / response |
| Rate limit | AI endpointy by mali mať budget guard alebo rate-limit middleware |
| CORS | `CORS_ORIGIN` je restrictive v prod, nie `*` |
| Dependencies | každá nová externá služba má `isXEnabled()` guard ak chýba kľúč |

Výstup: rovnaký formát ako code-review.

---

## FÁZA 6 — FIX & RETEST

- 🔴 Critical → **vždy oprav**, znova spusti testy.
- 🟡 Warning → oprav ak je to triviálne; inak nechaj `// TODO: <popis>` s odkazom.
- 🟢 Info → poznač do summary.

Po každej oprave znova testy.

---

## FÁZA 7 — SUMMARY

Záverečné zhrnutie pre používateľa:

```
### Hotovo: <názov úlohy>

**Zmenené súbory**
- path — čo sa zmenilo

**Nové súbory**
- path — čo robí

**Kľúčové rozhodnutia**
- prečo netriviálna voľba

**TODO**
- otvorené veci ak sú

**Odporúčané ďalšie kroky**
- napr. manuálny test v dev mode, deploy, ...
```

**Necommituj automaticky.** Používateľ rozhodne kedy commit + push.

---

## Mapa modelov

| Fáza | Model | Prečo |
|---|---|---|
| 0 Clarify | Opus 4.7 | Najsilnejšie pochopenie zámeru |
| 1 Explore | Haiku 4.5 | Lacné/rýchle čítanie kódu |
| 2 Plan | hlavný Claude | Drží kontext z 0+1 |
| 3 Implement | hlavný Claude | Píše kód |
| 5 Review | Sonnet 4.6 | Balans kvality a ceny |
| 5b Security | Sonnet 4.6 | Detto |
