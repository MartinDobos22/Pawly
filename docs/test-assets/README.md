# Test assety — fiktívne dokumenty pre AI extraction

Sada 10 fiktívnych dokumentov na opakovateľné testovanie OCR pipeline
(`Google Vision → OpenAI Vision → pdf-parse → none`), `examAlias` detekcie a odolnosti
voči prompt injection (`sanitizeOcrText`). Používa sa spolu s
[`../launch-test-plan.md`](../launch-test-plan.md), sekcia **S9**.

> **Žiadne reálne PII.** Mená, kliniky, čísla čipov a batch sú vymyslené.

## Ako vyrobiť PDF / JPG zo zdrojových markdownov

Každý asset je markdown s frontmatter blokom (cieľ testu + očakávaný AI output). Telo
markdownu je hotový obsah pripravený na vykreslenie.

### Spôsob 1 — pandoc (najrýchlejšie, čistý PDF)

```bash
# Inštalácia (Debian/Ubuntu)
sudo apt-get install pandoc texlive-xetex

# Generuj PDF
pandoc 01-veterinarny-pas.md -o 01-veterinarny-pas.pdf \
  --pdf-engine=xelatex -V geometry:a4paper -V mainfont="DejaVu Sans"

# Batch všetkých
for f in 0[1-9]-*.md 10-*.md; do
  pandoc "$f" -o "${f%.md}.pdf" --pdf-engine=xelatex -V geometry:a4paper -V mainfont="DejaVu Sans"
done
```

### Spôsob 2 — Browser print-to-PDF (vyzerá realistickejšie)

1. Otvor markdown v prehliadači markdownu (VS Code preview, Obsidian, Marked).
2. `Ctrl+P` → "Save as PDF" → A4.
3. Pre niektoré assety (napr. veterinárny pas) skopíruj obsah do Google Docs s logom kliniky kvôli realistickej layout → Súbor → Stiahnuť → PDF.

### Spôsob 3 — Mobil foto (povinné pre OCR fallback test)

Aspoň 1 asset (odporúčame `01-veterinarny-pas`) vyfoť **mobilom**:

- Trochu šikmý uhol (15-30°).
- Žltkasté domáce svetlo.
- Lesklý povrch s odleskami.

Výsledný JPG je vstup pre test **S4.10** a **S4.16** (OCR ladder fallback).

## Mapping asset → endpoint → test ID

| ID  | Súbor                        | Formát  | Endpoint                                                      | Test ID (launch-test-plan.md) | Očakávaný výsledok                                                         |
| --- | ---------------------------- | ------- | ------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| 01  | `01-veterinarny-pas.md`      | PDF+JPG | `POST /api/interpret-passport`                                | S6.11.1, S9.3.1, S4.10        | 2 vakcinácie (rabies+kombinovaná) + 1 odčervenie s dátumami, batch numbers |
| 02  | `02-veterinarny-pas-cat.md`  | PDF     | `POST /api/interpret-passport`                                | S9.3.2                        | Vakcinácie pre mačku (FeLV, panleukopénia)                                 |
| 03  | `03-krmivo-kvalitne.md`      | PDF     | `POST /api/analyze` (file)                                    | S4.7                          | score ≥ 70, ingredients quality good/excellent                             |
| 04  | `04-krmivo-problematicke.md` | PDF     | `POST /api/analyze` (file)                                    | S4.8                          | score < 50, harmful (BHA), pšenica allergen warning                        |
| 05  | `05-krmivo-allergen-trap.md` | PDF     | `POST /api/analyze` (file) s petProfile.allergies=['kuracie'] | S4.9, S3.6                    | critical allergen warning na hydrolyzovaný kuracie proteín                 |
| 06  | `06-lab-krv.md`              | PDF     | `POST /api/analyze` s `examAlias='laboratorne_vysetrenia'`    | S9.6.1                        | Prompt template pre `blood_tests` použitý (overiť v server logu)           |
| 07  | `07-rtg-report.md`           | PDF     | `POST /api/analyze` s `examAlias='rtg'`                       | S9.6.2                        | Prompt template pre `imaging`                                              |
| 08  | `08-ekg-report.md`           | PDF     | `POST /api/analyze` s `examAlias='ekg'`                       | S9.6.3                        | Prompt template pre `cardiology`                                           |
| 09  | `09-soap-vet-visit.md`       | PDF     | `POST /api/analyze` bez aliasu                                | S9.6.4                        | Heuristika z OCR detekuje typ (general / cardiology)                       |
| 10  | `10-prompt-injection.md`     | PDF     | `POST /api/analyze` + `POST /api/interpret-passport`          | S9.1.6, S9.3.5, S11.8         | AI ignoruje injection; `sanitizeOcrText` wrap viditeľný v server logu      |

## Odporúčaná sada na launch QA

Minimum: 01.pdf, 01.jpg (foto), 03.pdf, 04.pdf, 05.pdf, 10.pdf.
Plné pokrytie: všetkých 10 v PDF + 01/04 aj v JPG (mobilná kvalita).

## Údržba

Pri zmene `server/src/services/aiService.ts` system prompts alebo `examAlias` mapy
prejdi všetky assety znovu — AI output sa môže drift-núť. Zmeny očakávaného outputu
zapíš priamo do frontmatter každého assetu.
