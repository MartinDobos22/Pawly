---
asset_id: 01
ucel: Test AI parsing veterinárneho pasu psa cez POST /api/interpret-passport + OCR ladder cez POST /api/analyze (file mode JPG).
test_ids: [S6.11.1, S9.3.1, S4.10, S4.16]
ocakavany_ai_output: |
  {
    "records": [
      { "type": "vaccination", "name": "Nobivac Rabies", "dateApplied": "2024-03-12", "validUntil": "2027-03-12", "batchNumber": "A123BC" },
      { "type": "vaccination", "name": "Nobivac DHPPi", "dateApplied": "2024-03-12", "validUntil": "2025-03-12", "batchNumber": "B987ZX" },
      { "type": "deworming", "productName": "Milbemax", "dateGiven": "2025-01-20", "intervalDays": 90 }
    ]
  }
generation_hint: pandoc -o 01-veterinarny-pas.pdf --pdf-engine=xelatex -V mainfont="DejaVu Sans"; pre JPG: open PDF, screenshot 1. strany, save as 01-veterinarny-pas.jpg
---

# EUROPEAN PET PASSPORT / EURÓPSKY PAS SPOLOČENSKÉHO ZVIERAŤA

Issued by: Veterinárna klinika Tatra, Hlavná 12, 040 01 Košice, Slovensko
Vet: MVDr. Jana Horváthová, IČO 12345678

## I. Vlastník / Owner

| Pole    | Hodnota                  |
| ------- | ------------------------ |
| Meno    | Peter Ukážka             |
| Adresa  | Brezová 5, 040 11 Košice |
| Telefón | +421 900 000 000         |

## II. Identifikácia zvieraťa / Animal identification

| Pole              | Hodnota                      |
| ----------------- | ---------------------------- |
| Meno              | Bono                         |
| Druh              | Pes (Canis lupus familiaris) |
| Plemeno           | Border Collie                |
| Pohlavie          | M (kastrovaný)               |
| Dátum narodenia   | 2022-06-15                   |
| Sfarbenie         | Čierno-biela                 |
| Microchip         | 945000012345678              |
| Dátum implantácie | 2022-08-01                   |
| Číslo pasu        | SK01234567                   |

## III. Vakcinácia proti besnote / Anti-rabies vaccination

| Dátum aplikácie | Vakcína        | Šarža (Batch) | Platnosť do | Veterinár           |
| --------------- | -------------- | ------------- | ----------- | ------------------- |
| 2024-03-12      | Nobivac Rabies | A123BC        | 2027-03-12  | MVDr. J. Horváthová |

## IV. Iné vakcinácie / Other vaccinations

| Dátum aplikácie | Vakcína                                                                     | Šarža  | Platnosť do | Veterinár           |
| --------------- | --------------------------------------------------------------------------- | ------ | ----------- | ------------------- |
| 2024-03-12      | Nobivac DHPPi (kombinovaná: psinka, parvoviróza, hepatitída, parainfluenza) | B987ZX | 2025-03-12  | MVDr. J. Horváthová |

## V. Antiparazitárna liečba (echinococcus) / Anti-echinococcus treatment

| Dátum      | Produkt  | Účinná látka                   | Veterinár           |
| ---------- | -------- | ------------------------------ | ------------------- |
| 2025-01-20 | Milbemax | milbemycín oxim + prazikvantel | MVDr. J. Horváthová |

Interval podávania: 90 dní. Nasledujúce odčervenie odporúčané: 2025-04-20.

## VI. Klinické vyšetrenia / Clinical examinations

| Dátum      | Účel                       | Záver                    |
| ---------- | -------------------------- | ------------------------ |
| 2024-03-12 | Pred-vakcinačné vyšetrenie | Klinicky zdravý          |
| 2024-09-08 | Pravidelná kontrola        | Bez patologického nálezu |

Pečiatka kliniky: [pečiatka]
Podpis: [podpis]
