# PWA pravidlá

Idete live → PWA chyby sú user-visible. Tieto pravidlá sú **tvrdé**.

## Service Worker (`client/public/sw.js`)

### Cache versioning

- Premenná v `sw.js` sa volá `CACHE_VERSION` (aktuálne `animalPassport-v3`). Z nej sa odvodia `STATIC_CACHE` a `DYNAMIC_CACHE`.
- Pri **akejkoľvek zmene** statických aktív (manifest, ikony, obsah cachovaných súborov, app shell) **MUSÍŠ** zvýšiť verziu (napr. `animalPassport-v3` → `animalPassport-v4`).
- Bez bumpu používatelia uvidia starý JS/CSS aj po deploy → biele obrazovky, broken funkcie.
- V `activate` evente sa staré cache mažú (`caches.keys()` → delete všetko okrem aktuálneho `STATIC_CACHE` a `DYNAMIC_CACHE`).

### Stratégia

- **App shell** (HTML, JS, CSS): cache-first s network fallback.
- **API volania** (`/api/*`): network-only (alebo network-first s krátkym timeoutom). **Nikdy** necachuj API odpovede ako trvalé — sú dynamické.
- **Obrázky/ikony:** cache-first.

### Offline fallback

- `client/public/offline.html` — zobrazuje sa keď fetch zlyhá a stránka nie je v cache.
- Musí byť **self-contained**: žiadne externé fonty, CDN-ové CSS, žiadne JS volania.

## Manifest (`client/public/manifest.json`)

Povinné polia:

- `name`, `short_name`
- `start_url` — `/` alebo plne kvalifikovaná
- `display: "standalone"`
- `background_color`, `theme_color` — match s MUI témou
- `icons[]` — minimálne 192×192 a 512×512, oba s `purpose: "any maskable"`

## Registrácia SW

- Registruje sa v `client/src/main.tsx` (alebo dedikovanom module).
- **Len v produkcii** (`if (import.meta.env.PROD)`), nie v dev mode (Vite HMR sa zlomí).

## Update flow pre používateľa

Keď SW deteguje novú verziu:
1. `skipWaiting()` v novom SW
2. `clients.claim()` v `activate`
3. Klient by mal ukázať notifikáciu "Nová verzia, klikni pre obnovenie" — ak ešte nie je, je to `// TODO`.

## Ikony

- 192×192 a 512×512 PNG sú minimum pre Lighthouse PWA audit.
- Pri zmene ikon **vždy** bump `CACHE_NAME` verzie.

## Code review checklist (PWA)

- [ ] Zmenil si `sw.js` alebo aktívum v `public/` → bumpnutý `CACHE_NAME`?
- [ ] `offline.html` self-contained (žiadne externé requesty)?
- [ ] Manifest má `name`, `start_url`, `icons` 192+512, `display: standalone`?
- [ ] SW je registrovaný len v PROD?
- [ ] API endpointy nie sú cached na permanent?
