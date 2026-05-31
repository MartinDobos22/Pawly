---
asset_id: 08
ucel: Test examAlias='ekg' → AI prompt template pre cardiology.
test_ids: [S9.6.3]
ocakavany_ai_output: |
  {
    "detected_exam_type": "cardiology",
    "rhythm": "sínusový",
    "heart_rate_bpm": 112,
    "key_findings": ["sínusový rytmus", "bez arytmie", "elektrická os v norme"]
  }
generation_hint: pandoc -o 08-ekg-report.pdf --pdf-engine=xelatex
---

# EKG NÁLEZ — Elektrokardiografia

**Pracovisko:** Kardiologická ambulancia VetCardio, Račianska 12, 831 02 Bratislava
**Pacient:** Bono (pes, Border Collie, M kastrovaný, 3 roky)
**Dátum vyšetrenia:** 2025-04-14
**Indikácia:** Predoperačné kardiovaskulárne vyšetrenie pred plánovanou stomatologickou intervenciou.

## Technika

- 6-zvodové EKG (I, II, III, aVR, aVL, aVF)
- Rýchlosť papiera: 50 mm/s
- Amplitúda: 10 mm/mV
- Pacient v ľavej laterálnej polohe, bez sedácie.

## Merania

| Parameter             | Hodnota  | Norma (pes 15-25 kg) |
| --------------------- | -------- | -------------------- |
| Frekvencia (BPM)      | 112      | 70 – 160             |
| Rytmus                | sínusový | sínusový             |
| P vlna trvanie        | 0,04 s   | < 0,04 s             |
| P vlna amplitúda      | 0,2 mV   | < 0,4 mV             |
| PR interval           | 0,11 s   | 0,06 – 0,13 s        |
| QRS trvanie           | 0,05 s   | < 0,06 s             |
| R vlna amplitúda (II) | 1,8 mV   | < 3,0 mV             |
| QT interval           | 0,19 s   | 0,15 – 0,25 s        |
| Elektrická os         | +75°     | +40° – +100°         |

## Popis

Sínusový rytmus s pravidelnou frekvenciou 112/min. P vlny pozitívne v zvodoch I, II, aVF — fyziologická depolarizácia predsiení. QRS komplexy úzke, bez patologických Q vĺn. ST segment izoelektrický. T vlna pozitívna v II.

Bez známok komorovej extrasystoly, bez sínusovej arytmie nad fyziologickú mieru pri dýchaní.

## Záver

EKG bez patologického nálezu. Pacient je kardiologicky vhodný kandidát na celkovú anestéziu pre plánovaný zákrok.

Vyhotovil: MVDr. Eva Srdcová, Dipl. ECVIM-CA (Cardiology)
