---
asset_id: 06
ucel: Test examAlias='laboratorne_vysetrenia' → AI prompt template pre blood_tests (server/src/services/examAliasPrompts.ts).
test_ids: [S9.6.1]
ocakavany_ai_output: |
  {
    "detected_exam_type": "blood_tests",
    "key_findings": ["mierne zvýšené ALT", "leukocytóza", "ostatné v norme"],
    "recommendations_should_mention": ["pečeňové enzýmy", "kontrola", "veterinár"]
  }
generation_hint: pandoc -o 06-lab-krv.pdf --pdf-engine=xelatex
---

# LABORATÓRNY NÁLEZ — Hematológia + Biochémia

**Laboratórium:** VetLab Slovakia s.r.o., Bratislavská 45, 010 01 Žilina
**Žiadateľ:** Veterinárna klinika Tatra, MVDr. Jana Horváthová
**Pacient:** Bono (pes, Border Collie, M kastrovaný, 3 roky, 18 kg)
**Microchip:** 945000012345678
**Dátum odberu:** 2025-04-10
**Dátum spracovania:** 2025-04-11
**ID vzorky:** VL-2025-04-1138

## Krvný obraz (CBC)

| Parameter  | Hodnota | Jednotka | Ref. rozmedzie | Status |
| ---------- | ------- | -------- | -------------- | ------ |
| WBC        | 16,4    | 10^9/L   | 6,0 – 12,0     | HIGH   |
| RBC        | 6,8     | 10^12/L  | 5,5 – 8,5      | norm   |
| Hemoglobín | 158     | g/L      | 120 – 180      | norm   |
| Hematokrit | 0,46    | L/L      | 0,37 – 0,55    | norm   |
| MCV        | 68      | fL       | 60 – 77        | norm   |
| Trombocyty | 285     | 10^9/L   | 200 – 500      | norm   |
| Neutrofily | 78      | %        | 60 – 77        | HIGH   |
| Lymfocyty  | 14      | %        | 12 – 30        | norm   |
| Monocyty   | 6       | %        | 3 – 10         | norm   |
| Eozinofily | 2       | %        | 2 – 10         | norm   |

## Biochemický profil

| Parameter         | Hodnota | Jednotka | Ref. rozmedzie | Status |
| ----------------- | ------- | -------- | -------------- | ------ |
| ALT               | 142     | U/L      | 10 – 100       | HIGH   |
| AST               | 38      | U/L      | 10 – 50        | norm   |
| ALP               | 88      | U/L      | 20 – 150       | norm   |
| GGT               | 4       | U/L      | 0 – 10         | norm   |
| Celkový bilirubín | 4,2     | µmol/L   | 1 – 7          | norm   |
| Močovina          | 6,1     | mmol/L   | 3,0 – 9,0      | norm   |
| Kreatinín         | 88      | µmol/L   | 50 – 110       | norm   |
| Celkový proteín   | 64      | g/L      | 55 – 75        | norm   |
| Albumín           | 32      | g/L      | 28 – 38        | norm   |
| Glukóza           | 5,4     | mmol/L   | 3,3 – 6,5      | norm   |
| Vápnik            | 2,5     | mmol/L   | 2,1 – 2,9      | norm   |
| Fosfor            | 1,4     | mmol/L   | 0,8 – 2,0      | norm   |

## Záver laboratória

Mierne zvýšená hodnota ALT (142 U/L pri norme do 100). Mierna leukocytóza s neutrofíliou.
Ostatné parametre v referenčnom rozmedzí. Odporúčaná kontrola pečeňových enzýmov o 4 týždne.

Vyhotovil: RNDr. Pavol Lab, KKP Diplomovaný klinický biochemik
