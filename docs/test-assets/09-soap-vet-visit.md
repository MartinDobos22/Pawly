---
asset_id: 09
ucel: Test heuristickej detekcie typu vyšetrenia z OCR textu (bez explicitného examAlias) — SOAP zápis z bežnej návštevy.
test_ids: [S9.6.4]
ocakavany_ai_output: |
  {
    "detected_exam_type_should_be_one_of": ["general", "dermatology"],
    "diagnosis_extracted": "pyodermatitis superficialis",
    "medications_extracted": [
      { "name": "Amoxicillin-clavulanate", "dose": "250 mg", "frequency": "BID", "durationDays": 10 }
    ],
    "next_check": "2025-05-02"
  }
generation_hint: pandoc -o 09-soap-vet-visit.pdf --pdf-engine=xelatex
---

# ZÁPIS Z NÁVŠTEVY VETERINÁRA

**Klinika:** Veterinárna klinika Tatra, Hlavná 12, 040 01 Košice
**Veterinár:** MVDr. Jana Horváthová
**Dátum:** 2025-04-22, 10:30
**Pacient:** Bono (pes, Border Collie, M kastrovaný, 3 roky, 18,2 kg)
**Vlastník:** Peter Ukážka, +421 900 000 000

## Dôvod návštevy

Vlastník hlási opakované škriabanie a olizovanie ľavého boku posledné 2 týždne.
Bez vracania, chuť do jedla zachovaná, vyprázdňovanie normálne.

## S — Subjective (anamnéza)

- Krmivo: PREMIUM ADULT (NaturePet), kŕmený 2× denne, dávka 220 g.
- Posledné odčervenie: 2025-01-20 (Milbemax).
- Posledná vakcinácia: 2024-03-12 (Nobivac DHPPi + Rabies).
- Žiadne nové prostredie, žiadny kontakt s inými zvieratami.
- Vlastník použil prostriedok proti blchám (Bravecto, 2025-03-15).

## O — Objective (vyšetrenie)

- TT: 38,7 °C; SF: 96/min; DF: 22/min; CRT < 2 s; sliznice ružové.
- Hmotnosť: 18,2 kg (predchádzajúca kontrola 18,0 kg).
- Koža: ľavý bok — okrúhle erytematózne plochy ~2 cm s pustulami, papuly, mierna alopécia.
- Bez ektoparazitov (visual + skúmavkové prečesanie).
- Auskultácia: srdcový rytmus pravidelný, bez šelestov; pľúca čisté.
- Abdomen: palpácia nebolestivá.
- LU: regionálne lymfatické uzliny nepalpovateľné, bez zväčšenia.

## A — Assessment (diagnóza)

**Pyodermatitis superficialis** — povrchová bakteriálna infekcia kože.
Diferenciálne diagnózy: alergická dermatitída (potenciálne kontaktná alebo potravinová),
demodikóza (po cytologickom vyšetrení vylúčené).

Cytológia z pustúl: koky (Staphylococcus pseudintermedius pravdepodobne).

## P — Plan (plán)

1. **Amoxicillin-clavulanate 250 mg BID per os 10 dní** (Synulox, 1 tableta ráno + 1 večer s jedlom).
2. Kúpanie chlorhexidínovým šampónom (4 %) 2× týždenne.
3. Stop suspekt na potravinovú alergiu — zváženie eliminačnej diéty pri opakovaní.
4. Kontrola o 10 dní (**2025-05-02**) — re-evaluácia kožných lézií.
5. Pri zhoršení (horúčka, letargia, refúzia potravy) okamžite kontakt.

Vlastník informovaný o priebehu liečby a side-effects ATB (možné riedke stolice).
Podpísaný informovaný súhlas.

Podpis veterinára: MVDr. J. Horváthová
