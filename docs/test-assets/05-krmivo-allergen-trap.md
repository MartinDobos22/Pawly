---
asset_id: 05
ucel: Test allergen detekcie keď pet profile má alergiu na kuracie — krmivo má hydrolyzovaný kurací proteín (skrytá forma), AI musí critical warning.
test_ids: [S4.9, S3.6]
ocakavany_ai_output: |
  {
    "allergenWarnings": [
      {
        "allergen": "kuracie",
        "ingredient_source": "Hydrolyzovaný kurací proteín",
        "severity": "critical"
      }
    ],
    "personalizedNote": { "verdict": "NEBEZPEČNÉ" }
  }
predpoklady: Active pet má v profile allergies = ["kuracie"] alebo ["chicken"].
generation_hint: pandoc -o 05-krmivo-allergen-trap.pdf --pdf-engine=xelatex
---

# HYPO SENSITIVE — Lamb & Rice

> _"Vyvinuté pre psov s citlivým trávením"_ — marketing claim

**Výrobca:** SenseFood Ltd., 14 Castle Rd, Dublin, Írsko
**Hmotnosť:** 10 kg
**Šarža:** SF-2025-LR-04

## Zloženie

Jahňacie mäso čerstvé (24 %), ryža (20 %), zemiaky sušené (15 %), jahňacia múčka (10 %), **hydrolyzovaný kurací proteín (8 %)**, bravčová masť (konzervovaná tokoferolom, 5 %), repné rezky (3 %), pivovarské kvasnice (2 %), rybí olej (1,5 %), ľanové semienka (1 %), mrkva sušená (0,5 %), juka (Yucca schidigera), glukosamín (500 mg/kg), chondroitín (300 mg/kg).

## Analytické zložky

| Parameter      | Hodnota |
| -------------- | ------- |
| Hrubé proteíny | 24 %    |
| Hrubé tuky     | 14 %    |
| Hrubá vláknina | 3 %     |
| Hrubý popol    | 7 %     |
| Vlhkosť        | 9 %     |

## Vyhlásenie alergén-friendly

Krmivo neobsahuje pšenicu, kukuricu ani soju. Hlavný proteín: jahňa.

> **Skrytá výzva pre AI:** "hydrolyzovaný kurací proteín" je kuracie, hoci hydrolyzát.
> AI musí varuj usera ktorého pes je alergický na kuracie aj tak.

## Vitamíny a minerály (na kg)

Vit. A 15 000 IU, Vit. D3 1 500 IU, Vit. E 200 mg, Zn 120 mg, Mn 25 mg, Fe 70 mg.

## Návod na kŕmenie

Pes 5 kg: 90 g, pes 10 kg: 150 g, pes 20 kg: 250 g, pes 30 kg: 330 g.
