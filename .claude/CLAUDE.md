# Claude pravidlá — index

Tento adresár drží detailné pravidlá. Hlavný `CLAUDE.md` v rootovom adresári odkazuje sem pri akciách ktoré si vyžadujú kontext.

## Pravidlá

- [`rules/repo-shape.md`](rules/repo-shape.md) — adresárová štruktúra, aktuálne stránky a endpointy, kde čo patrí
- [`rules/commands.md`](rules/commands.md) — npm skripty pre klient + server
- [`rules/architecture.md`](rules/architecture.md) — frontend + backend architektúra, rate limiting, perzistencia
- [`rules/pwa.md`](rules/pwa.md) — Service Worker (`CACHE_VERSION='animalPassport-vN'`), manifest, offline
- [`rules/conventions.md`](rules/conventions.md) — API error shape, AI/OCR usage, OCR sanitizácia, exam alias, logy
- [`rules/env-vars.md`](rules/env-vars.md) — environment premenné (server + klient `VITE_API_URL`)
- [`rules/health-passport.md`](rules/health-passport.md) — domény zdravotný pas / denník epizód / karta pre veterinára

## Skills

- [`skills/implement/SKILL.md`](skills/implement/SKILL.md) — pipeline pre `/implement <úloha>`

## Agenti

- [`agents/task-clarifier.md`](agents/task-clarifier.md) — Fáza 0 (Opus 4.7)
- [`agents/explorer.md`](agents/explorer.md) — Fáza 1 (Haiku 4.5)
- [`agents/code-reviewer.md`](agents/code-reviewer.md) — Fáza 5 (Sonnet 4.6)
- [`agents/security-reviewer.md`](agents/security-reviewer.md) — Fáza 5b (Sonnet 4.6)

## Hooks

- `hooks/pre-tool-branch-guard.cjs` — PreToolUse, vytvorí branch ak si na `main`
- `hooks/post-write-prettier.cjs` — PostToolUse, auto-format
- `hooks/stop-test-gate.cjs` — Stop, blokuje turn ak testy zlyhajú
- `hooks/stop-review-gate.cjs` — Stop, informatívny review reminder
- `hooks/stop-security-gate.cjs` — Stop, varovanie ak `server/` zmenené
