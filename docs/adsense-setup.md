# Google AdSense — nasadenie v Pawly

Tento dokument popisuje, ako požiadať o AdSense a ako zapnúť reklamy v Pawly.
Celá reklamná vrstva je **vypnutá cez feature-flag**, kým nenastavíš `VITE_ADSENSE_CLIENT`
— nasadenie kódu je preto bezpečné aj pred schválením.

## 1. Predpoklady pred žiadosťou

- ✅ Originálny obsah (články v Poradni), navigácia, funkčné odkazy.
- ✅ Privacy Policy (`/ochrana-sukromia`), Kontakt (`/kontakt`), O aplikácii (`/o-aplikacii`).
- ✅ Web je nasadený na vlastnej doméne a **indexovaný** v Google.

## 2. Žiadosť o AdSense

1. Choď na **adsense.google.com** a prihlás sa Google účtom.
2. **Sites → Add site** → `pawly.sk`.
3. AdSense ti dá overovací kód/snippet a **Publisher ID** (`pub-…` / `ca-pub-…`).
4. Vyplň platobné a daňové údaje.
5. **Request review** → schvaľovanie trvá dni až týždne (výsledok príde e-mailom).

> Časté zamietnutie „insufficient content" → dopíš viac kvalitných článkov a skús znova.

## 3. `ads.txt`

Súbor je v `client/public/ads.txt` (nasadí sa na `https://pawly.sk/ads.txt`).
**Nahraď `pub-0000000000000000` svojím Publisher ID** (nájdeš v AdSense → Account → Account
information). Bez správneho `ads.txt` AdSense hlási „Earnings at risk".

## 4. Zapnutie reklám (env premenné)

Nastav v **Netlify → Site settings → Environment variables** (nie do gitu):

| Premenná                    | Hodnota                     | Povinné                   |
| --------------------------- | --------------------------- | ------------------------- |
| `VITE_ADSENSE_CLIENT`       | `ca-pub-XXXXXXXXXXXXXXXX`   | áno (master flag)         |
| `VITE_ADSENSE_SLOT_ARTICLE` | slot ID in-article jednotky | len pre manuálnu jednotku |

Po nastavení **spusti nový build** (env sa čítajú pri builde). Skript sa načíta **len v PROD**.

## 5. Auto Ads vs. manuálne jednotky

- **Auto Ads (odporúčané na štart):** v AdSense zapni Auto Ads. Google umiestňuje reklamy
  automaticky — stačí `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT_ARTICLE` netreba.
- **Manuálna in-article jednotka:** vytvor Display ad unit, jej slot ID daj do
  `VITE_ADSENSE_SLOT_ARTICLE`. Vykreslí ju komponent `AdUnit` v `ArticleView`
  (medzi telom článku a CTA). Skrytá pri tlači aj v admin preview.

## 6. Súhlas (GDPR / EÚ) — povinné

Keďže cieliš na EÚ, Google vyžaduje **consent banner**. Nemusíš ho programovať:
v AdSense zapni **Privacy & messaging → GDPR message** (Funding Choices) — banner sa
zobrazí automaticky cez načítaný AdSense skript. Bez neho reklamy v EEA nepobežia korektne.

## 7. Kde reklamy (ne)sú

- **Verejné články** (`/poradna/*`) — áno (`AdUnit`).
- **Aplikačné stránky za prihlásením** (zdravotný pas, denník…) — **nie** (`AdUnit` sa tam
  nepoužíva; sú aj `noindex`).
- **Karta pre veterinára / tlač** — `AdUnit` má `@media print { display:none }`.

## 8. Súvisiaci kód

| Súbor                                          | Účel                                            |
| ---------------------------------------------- | ----------------------------------------------- |
| `client/public/ads.txt`                        | Authorized sellers (uprav pub ID)               |
| `client/src/utils/adsense.ts`                  | Feature-flag + loader `adsbygoogle.js`          |
| `client/src/main.tsx`                          | Načítanie skriptu (len PROD + enabled)          |
| `client/src/components/AdUnit.tsx`             | Reklamná jednotka (`<ins class="adsbygoogle">`) |
| `client/src/components/public/ArticleView.tsx` | Umiestnenie `AdUnit` v článku                   |

> Pri zmene statických aktív pamätaj na bump `CACHE_VERSION` v `client/public/sw.js`.
