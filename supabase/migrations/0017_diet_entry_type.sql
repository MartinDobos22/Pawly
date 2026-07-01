-- AnimalPassport — typ krmiva (food_type) pre diet_entries
-- Umožňuje odlíšiť hlavné krmivo, mokré, pamlsky a doplnky.
-- 'main'/'wet' = jedno aktuálne naraz; 'treats'/'supplement' = môže byť viac súčasne.
-- Backend pristupuje cez service_role; tabuľka už je v health RPC allowliste (0006).

alter table diet_entries
  add column if not exists food_type text not null default 'main';
