---
asset_id: 04
ucel: Test /api/analyze (file mode) na lacné krmivo plné problematických ingrediencií — očakávaný nízky score, harmful (BHA/BHT), allergen warning (pšenica, kukurica).
test_ids: [S4.8]
ocakavany_ai_output: |
  {
    "score_max": 45,
    "ingredients_harmful": ["BHA", "BHT", "Etoxychín"],
    "ingredients_low_quality": ["Mäsové vedľajšie produkty (nedefinované)", "Kukuričná múka", "Pšeničné mleté zvyšky"],
    "allergenWarnings": [
      { "allergen": "pšenica", "severity": "high" },
      { "allergen": "kukurica", "severity": "moderate" }
    ],
    "healthWarnings": [
      { "condition": "digestion", "severity": "moderate" }
    ],
    "personalizedNote": { "verdict": "S VÝHRADAMI" }
  }
generation_hint: pandoc -o 04-krmivo-problematicke.pdf --pdf-engine=xelatex
---

# ECO ECONOMY DOG FOOD — Mäsová zmes

**Výrobca:** BillenCorp B.V., Industrieweg 12, Eindhoven, NL
**Hmotnosť:** 20 kg
**Šarža:** BC-9981-X
**Min. trvanlivosť:** 18 mesiacov od dátumu výroby

## Zloženie (Composition)

Obilniny (min. 4 % kukuričná múka, pšeničné mleté zvyšky, jačmeň), mäso a mäsové vedľajšie produkty (min. 4 % hydina), rastlinné vedľajšie produkty, oleje a tuky (živočíšne), minerálne látky, cukor, soľ, melasa, hydrolyzát rastlinných bielkovín, prírodná a umelá aróma.

## Analytické zložky

| Parameter      | Hodnota |
| -------------- | ------- |
| Hrubé proteíny | 18 %    |
| Hrubé tuky     | 8 %     |
| Hrubá vláknina | 5,5 %   |
| Hrubý popol    | 9,5 %   |
| Vlhkosť        | 10 %    |
| Vápnik         | 2,1 %   |
| Fosfor         | 1,4 %   |

## Konzervanty a antioxidanty

Antioxidanty: **BHA (E320), BHT (E321), etoxychín**. Konzervanty: dusitan sodný.
Farbivá: E102 (tartrazín), E110 (žlť SY), E124 (košenila červeň 4R), karamel (E150).

## Doplnkové látky (na kg)

Vit. A 5 000 IU, Vit. D3 500 IU, Cu (síran meďnatý) 8 mg.

## Návod na kŕmenie

Pes 10 kg: 200 g denne. Pes 20 kg: 350 g denne.

## Upozornenia

Krmivo nie je vhodné pre šteňatá do 6 mesiacov.
