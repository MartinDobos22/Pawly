---
asset_id: 02
ucel: Test AI parsing veterinárneho pasu pre mačku — overiť že parser zvládne iný druh než pes.
test_ids: [S9.3.2]
ocakavany_ai_output: |
  {
    "records": [
      { "type": "vaccination", "name": "Purevax RCP", "dateApplied": "2024-05-04", "validUntil": "2025-05-04", "batchNumber": "PV4421" },
      { "type": "vaccination", "name": "Purevax FeLV", "dateApplied": "2024-05-04", "validUntil": "2025-05-04", "batchNumber": "FE7788" },
      { "type": "vaccination", "name": "Rabisin", "dateApplied": "2024-05-04", "validUntil": "2027-05-04", "batchNumber": "RB0099" },
      { "type": "deworming", "productName": "Drontal Cat", "dateGiven": "2025-02-15", "intervalDays": 90 }
    ]
  }
generation_hint: pandoc -o 02-veterinarny-pas-cat.pdf --pdf-engine=xelatex
---

# EURÓPSKY PAS SPOLOČENSKÉHO ZVIERAŤA — MAČKA

Klinika: Mačacia ambulancia Felis, Štúrova 88, 811 02 Bratislava
Vet: MVDr. Marek Polák

## Vlastník

Lucia Skúšková, Račianska 17, 831 02 Bratislava, +421 901 111 222

## Identifikácia

| Pole              | Hodnota             |
| ----------------- | ------------------- |
| Meno              | Mia                 |
| Druh              | Mačka (Felis catus) |
| Plemeno           | Perzská             |
| Pohlavie          | F (sterilizovaná)   |
| Dátum narodenia   | 2023-01-22          |
| Sfarbenie         | Krémová             |
| Microchip         | 945000098765432     |
| Dátum implantácie | 2023-03-10          |
| Číslo pasu        | SK02468013          |

## Vakcinácia proti besnote

| Dátum aplikácie | Vakcína | Šarža  | Platnosť do | Veterinár      |
| --------------- | ------- | ------ | ----------- | -------------- |
| 2024-05-04      | Rabisin | RB0099 | 2027-05-04  | MVDr. M. Polák |

## Ostatné vakcinácie

| Dátum      | Vakcína      | Pokrytie                                     | Šarža  | Platnosť do | Veterinár      |
| ---------- | ------------ | -------------------------------------------- | ------ | ----------- | -------------- |
| 2024-05-04 | Purevax RCP  | Rhinotracheitída, calicivírus, panleukopénia | PV4421 | 2025-05-04  | MVDr. M. Polák |
| 2024-05-04 | Purevax FeLV | Felínna leukémia                             | FE7788 | 2025-05-04  | MVDr. M. Polák |

## Odčervenie

| Dátum      | Produkt     | Účinná látka            | Interval |
| ---------- | ----------- | ----------------------- | -------- |
| 2025-02-15 | Drontal Cat | pyrantel + prazikvantel | 90 dní   |

## Klinické poznámky

- 2024-05-04: Pred-vakcinačné vyšetrenie OK, hmotnosť 3.8 kg.
- 2024-11-12: Kontrola, hmotnosť 4.1 kg, stav výživový primeraný.

Pečiatka kliniky: [pečiatka]
